export type CreateTaskDto = {
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
};
