export type FormInputs = {
  birthyear: number;
  isSmoker: boolean;
  jobIds?: { id: string; value: string }[]; // react-hook-form doesn't support flat arrays
};
