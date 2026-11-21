import { getAccessToken } from './firebase';

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface WorkspaceEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  description?: string;
  htmlLink?: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  due?: string;
  notes?: string;
}

export const WorkspaceService = {
  // Google Drive
  async listDriveFiles(): Promise<WorkspaceFile[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,modifiedTime,webViewLink)',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch Drive files');
    }
    const data = await res.json();
    return data.files || [];
  },

  async uploadFileToDrive(fileName: string, content: string, mimeType = 'text/plain'): Promise<WorkspaceFile> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const metadata = {
      name: fileName,
      mimeType,
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: mimeType }));

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to upload file to Google Drive');
    }
    return await res.json();
  },

  // Google Calendar
  async listCalendarEvents(): Promise<WorkspaceEvent[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const now = new Date().toISOString();
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        now
      )}&maxResults=10&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch Calendar events');
    }
    const data = await res.json();
    return data.items || [];
  },

  async createCalendarEvent(event: {
    summary: string;
    description: string;
    startTime?: string; // ISO
    endTime?: string; // ISO
    date?: string; // YYYY-MM-DD
    reminders?: {
      useDefault?: boolean;
      overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
    };
  }): Promise<WorkspaceEvent> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const body: Record<string, any> = {
      summary: event.summary,
      description: event.description,
    };

    if (event.date) {
      body.start = { date: event.date };
      body.end = { date: event.date };
    } else if (event.startTime && event.endTime) {
      body.start = { dateTime: event.startTime };
      body.end = { dateTime: event.endTime };
    } else if (event.startTime) {
      body.start = { dateTime: event.startTime };
      body.end = { dateTime: event.startTime };
    }

    if (event.reminders) {
      body.reminders = event.reminders;
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to schedule Calendar event');
    }
    return await res.json();
  },

  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok && res.status !== 404) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to delete Calendar event');
    }
    return true;
  },

  async createReservationMoveInEvent(
    reservation: {
      customerName: string;
      phone: string;
      email: string;
      unitSize: string;
      moveInDate: string;
      notes?: string;
    },
    facilityName: string,
    emailReminderMinutes = 1440
  ): Promise<WorkspaceEvent> {
    const reminderHours = Math.round(emailReminderMinutes / 60);
    const summary = `Move-In: ${reservation.customerName} (${reservation.unitSize}) — ${facilityName}`;
    const description = [
      `Move-In Appointment for ${facilityName}`,
      `----------------------------------------`,
      `Tenant: ${reservation.customerName}`,
      `Phone: ${reservation.phone}`,
      `Email: ${reservation.email}`,
      `Reserved Unit: ${reservation.unitSize}`,
      `Target Move-In Date: ${reservation.moveInDate}`,
      reservation.notes ? `Customer Notes: ${reservation.notes}` : '',
      ``,
      `⏰ Automated Reminders:`,
      `• Email reminder to owner: ${reminderHours >= 24 ? `${reminderHours / 24} day(s)` : `${reminderHours} hour(s)`} before move-in`,
      `• Mobile popup notification: 1 hour before move-in`,
      ``,
      `Managed via GateDesk · Powered by Retch VisionAI Solution`,
    ].filter(Boolean).join('\n');

    return this.createCalendarEvent({
      summary,
      description,
      date: reservation.moveInDate,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: emailReminderMinutes },
          { method: 'popup', minutes: 60 },
        ],
      },
    });
  },

  // Google Docs
  async createGoogleDoc(title: string, bodyContent: string): Promise<{ documentId: string; title: string; webViewLink: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    // 1. Create blank doc
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create Google Doc');
    }

    const doc = await createRes.json();
    const documentId = doc.documentId;
    const webViewLink = `https://docs.google.com/document/d/${documentId}/edit`;

    // 2. Insert text content
    if (bodyContent && documentId) {
      await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: bodyContent,
              },
            },
          ],
        }),
      });
    }

    return { documentId, title, webViewLink };
  },

  mergeTemplateFields(templateText: string, fields: Record<string, string>): string {
    let result = templateText;
    Object.entries(fields).forEach(([key, val]) => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, 'gi');
      result = result.replace(regex, val || '');
    });
    // Security guarantee: Never insert actual gate codes into any document
    result = result.replace(
      /\{\{\s*gate_code\s*\}\}/gi,
      '[Gate Policy: Personal PIN issued at onboarding; sharing prohibited]'
    );
    return result;
  },

  async generateLeaseGoogleDoc(params: {
    templateText: string;
    tenant: {
      name: string;
      phone: string;
      email?: string;
      unit: string;
      moveInDate?: string;
    };
    facility: {
      name: string;
      address: string;
      phone: string;
    };
    unitType?: {
      size: string;
      monthlyPrice: number;
      climateControlled?: boolean;
    };
  }): Promise<{ documentId: string; title: string; webViewLink: string; mergedText: string }> {
    const fields: Record<string, string> = {
      tenant_name: params.tenant.name,
      tenant_phone: params.tenant.phone,
      tenant_email: params.tenant.email || 'N/A',
      unit_number: params.tenant.unit,
      unit_size: params.unitType
        ? `${params.unitType.size} (${params.unitType.climateControlled ? 'Climate Controlled' : 'Standard'})`
        : 'Standard Storage Unit',
      monthly_rent: params.unitType ? String(params.unitType.monthlyPrice) : '145',
      move_in_date: params.tenant.moveInDate || new Date().toISOString().split('T')[0],
      facility_name: params.facility.name,
      facility_address: params.facility.address,
      facility_phone: params.facility.phone,
    };

    const mergedText = this.mergeTemplateFields(params.templateText, fields);
    const title = `Self-Storage Rental Agreement - ${params.tenant.name} (${params.tenant.unit})`;
    const result = await this.createGoogleDoc(title, mergedText);

    return {
      documentId: result.documentId,
      title,
      webViewLink: result.webViewLink,
      mergedText,
    };
  },

  async generateSOPGoogleDoc(params: {
    facility: {
      name: string;
      address: string;
      phone: string;
    };
    sections: {
      openingClosing: string;
      gateSecurity: string;
      overdueEscalation: string;
      emergencyProtocol: string;
      staffDirectory: string;
    };
  }): Promise<{ documentId: string; title: string; webViewLink: string; fullText: string }> {
    const fullText = [
      `STANDARD OPERATING PROCEDURES (SOP)`,
      `${params.facility.name.toUpperCase()}`,
      `Address: ${params.facility.address} | Phone: ${params.facility.phone}`,
      `Generated via GateDesk · Powered by Retch VisionAI Solution`,
      `--------------------------------------------------------------------------------`,
      ``,
      `SECTION 1: DAILY OPENING & CLOSING PROCEDURES`,
      params.sections.openingClosing,
      ``,
      `SECTION 2: GATE SECURITY & ACCESS CONTROL POLICY`,
      `Note: Actual tenant gate access codes are strictly confidential and must never be recorded on this SOP document.`,
      params.sections.gateSecurity,
      ``,
      `SECTION 3: OVERDUE RENT ESCALATION & LIEN NOTICE TIMELINE`,
      `[CRITICAL NOTICE: Adjust all steps and timelines to comply with your state's self-storage statutory lien and auction rules.]`,
      params.sections.overdueEscalation,
      ``,
      `SECTION 4: EMERGENCY RESPONSE & FACILITY INCIDENT PROTOCOL`,
      params.sections.emergencyProtocol,
      ``,
      `SECTION 5: STAFF CONTACT DIRECTORY & ESCALATION TREE`,
      params.sections.staffDirectory,
    ].join('\n\n');

    const title = `Standard Operating Procedures - ${params.facility.name}`;
    const result = await this.createGoogleDoc(title, fullText);

    return {
      documentId: result.documentId,
      title,
      webViewLink: result.webViewLink,
      fullText,
    };
  },

  // Google Tasks
  async listTasks(): Promise<WorkspaceTask[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?maxResults=20', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to fetch Google Tasks');
    }
    const data = await res.json();
    return data.items || [];
  },

  async createTask(task: { title: string; notes?: string; due?: string }): Promise<WorkspaceTask> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Workspace');

    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create Google Task');
    }
    return await res.json();
  },
};
