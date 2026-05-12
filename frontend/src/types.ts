export type SubmitFormValues = {
  name: string;
  message: string;
};

export type SubmitResponse = {
  name: string;
  message: string;
  filePath?: string;
};
