import { FileItem } from '../state/store';
import { generateId } from './utils';

export function seedDemoFiles(): FileItem[] {
  return [
    {
      id: generateId(),
      name: 'Q4_Financial_Report_2024.pdf',
      originalName: 'financial-report-q4-2024.pdf',
      type: 'pdf',
      size: 2048576,
      tags: ['financial', 'report', '2024'],
      folder: 'Documents',
      addedDate: new Date('2024-01-15'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iagoxIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKOCAwIG9iago8PAovVHlwZSAvTWV0YWRhdGEKPDwKL1R5cGUgL01ldGFkYXRhCi9EZXNjcmlwdGlvbiA8RGF0ZT4KPj4KPj4KZW5kb2JqCjcgMCBvago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
    },
    {
      id: generateId(),
      name: 'Team_Meeting_Notes_2024-01-15.txt',
      originalName: 'meeting-notes.txt',
      type: 'text',
      size: 2048,
      tags: ['meeting', 'notes', 'team'],
      folder: 'Documents',
      addedDate: new Date('2024-01-15'),
      content: `Team Meeting Notes - January 15, 2024

Attendees: John, Sarah, Mike, Lisa

Agenda:
1. Q4 Review
2. Q1 Planning
3. Budget Discussion
4. New Features

Key Points:
- Q4 targets exceeded by 15%
- New product launch scheduled for March
- Budget approved for additional hires
- Customer feedback very positive

Action Items:
- John: Prepare Q1 roadmap
- Sarah: Review budget allocation
- Mike: Research new technologies
- Lisa: Schedule customer interviews

Next Meeting: January 22, 2024`,
    },
    {
      id: generateId(),
      name: 'Invoice_Acme_Corp_2024-01-10.pdf',
      originalName: 'invoice-12345.pdf',
      type: 'pdf',
      size: 1024000,
      tags: ['invoice', 'acme', '2024'],
      folder: 'Documents',
      addedDate: new Date('2024-01-10'),
      url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVGQKL0YxIDEyIFRmCihJbnZvaWNlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFs1IDAgUl0KPj4KZW5kb2JqCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DcmVhdG9yCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9UeXBlIC9NZXRhZGF0YQo8PAovVHlwZSAvTWV0YWRhdGEKL0Rlc2NyaXB0aW9uIDxEYXRlPgo+Pgo+PgplbmRvYmoKNyAwIG9iago8PAovVHlwZSAvQ3JlYXRvcgo+PgplbmRvYmoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc0IDAwMDAwIG4gCjAwMDAwMDAyNzMgMDAwMDAgbiAKMDAwMDAwMDM0OCAwMDAwMCBuIAowMDAwMDAwNDk1IDAwMDAwIG4gCjAwMDAwMDA1NzQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA5Ci9Sb290IDEgMCBSCi9JbmZvIDggMCBSCj4+CnN0YXJ0eHJlZgo2NDMKJSVFT0Y=',
    },
    {
      id: generateId(),
      name: 'Screenshot_2024-01-12.png',
      originalName: 'screenshot.png',
      type: 'image',
      size: 512000,
      tags: ['screenshot', 'ui'],
      folder: 'Images',
      addedDate: new Date('2024-01-12'),
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    },
  ];
}
