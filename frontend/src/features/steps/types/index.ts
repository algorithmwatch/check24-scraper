export type FormInputs = {
  birthyear: number;
  isSmoker: boolean;
  jobIds?: { value: string }[]; // react-hook-form doesn't support flat arrays
};
