export interface Client {
  id: string;
  res: any;
}

export interface StreamEvent {
  type: "progress" | "success" | "error" | "complete";
  step: string;
  message: string;
  progress: number;
  data?: any;
}
