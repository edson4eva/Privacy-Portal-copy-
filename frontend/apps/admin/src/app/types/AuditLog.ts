import { AuditLogActionCategory } from '../enums/AuditLogActionCategory';
import { PublishWorkflowStatus } from './PublishStatus';

interface AuditLog {
    id: string;
    userId: string;
    action: string;
    description: string;
    status?: PublishWorkflowStatus;
    timestamp: Date;
}
interface AuditLogFilter {
    userId?: string;
    pattern?: string;
    actions?: string[];
    beginDate?: string;
    endDate?: string;
}

export { AuditLog, AuditLogFilter };
