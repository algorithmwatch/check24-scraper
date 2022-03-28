export type FormInputs = {
  birthyear: number;
  isSmoker: boolean;
  jobIds?: { value: number | undefined }[]; // react-hook-form doesn't support flat arrays
};
