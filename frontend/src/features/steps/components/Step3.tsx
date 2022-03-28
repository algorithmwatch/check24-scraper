import * as React from "react";
import { Button, Card } from "components/Elements";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInputs } from "..";
import { Autocomplete, Repeater } from "components/Form";
import jobs from "jobs.json";

const suggestions = jobs.map((job) => ({ id: job[0], value: job[1] }));

export const Step3 = ({
  setNextStep,
  setPreviousStep,
}: {
  setNextStep: () => void;
  setPreviousStep: () => void;
}) => {
  const {
    register,
    watch,
    control,
    formState: { errors, isValid },
  } = useFormContext<FormInputs>();
  const jobIds = useFieldArray({
    name: "jobIds",
    control,
  });

  return (
    <Card
      footer={
        <>
          <Button onClick={setNextStep} disabled={!isValid}>
            Weiter
          </Button>
          <Button variant="secondary" size="sm" onClick={setPreviousStep}>
            Zurück
          </Button>
        </>
      }
    >
      <p>
        Nun ist deine Kreativität gefragt. Gebe so viele Bezeichnungen für
        deinen Beruf ein, wie dir einfallen. Wenn du fertig bist, klicke auf
        “Absenden”.
      </p>

      {/* Repeater */}
      <div className="space-y-4">
        {!jobIds.fields.length && (
          <Button
            variant="secondary"
            onClick={() => jobIds.append({ value: "" })}
          >
            Add
          </Button>
        )}
        {jobIds.fields.map((item, index) => (
          <div key={item.id} className="flex space-x-2">
            <Autocomplete
              className="flex-grow"
              suggestions={suggestions}
              registration={register(`jobIds.${index}.value`, {
                // valueAsNumber: true,
              })}
            />

            <Button variant="secondary" onClick={() => jobIds.remove(index)}>
              -
            </Button>
            {index === jobIds.fields.length - 1 && (
              <Button
                variant="secondary"
                onClick={() => jobIds.append({ value: "" })}
              >
                +
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// <Repeater
// component={Autocomplete}
// fields={jobIds.fields}
// onRegister={(index) =>
//   register(`jobIds.${index}.value`, {
//     valueAsNumber: true,
//   })
// }
// onAppend={() => jobIds.append({ value: undefined })}
// onRemove={(index) => jobIds.remove(index)}
// />
