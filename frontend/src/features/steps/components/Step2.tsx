import React from "react";
import { Button, Card } from "components/Elements";
import { useFormContext } from "react-hook-form";
import { FormInputs } from "..";
import { Checkbox, FormGroup, TextInputGroup } from "components/Form";

export const Step2 = ({
  setNextStep,
  setPreviousStep,
}: {
  setNextStep: () => void;
  setPreviousStep: () => void;
}) => {
  const {
    register,
    formState: { errors, isValid },
  } = useFormContext<FormInputs>();

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
        Gebe hierfür zunächst dein Geburtsjahr an und ob du rauchst oder nicht.
      </p>
      <div className="mt-6 space-y-4">
        <TextInputGroup
          id="birthyear-input"
          label="Geburtsjahr"
          type="number"
          registration={register("birthyear", {
            valueAsNumber: true,
            required: "Bitte gebe dein Geburtsjahr ein",
            min: {
              value: 1975,
              message: "Das Geburtsjahr darf nicht kleiner als 1975 sein.",
            },
            max: {
              value: 1990,
              message: "Das Geburtsjahr darf nicht größer als 1990 sein.",
            },
          })}
          error={errors.birthyear}
        />
        <FormGroup label="Bist du Raucher*in?">
          <Checkbox
            id="is-smoker-input"
            label="Ja"
            defaultChecked={false}
            registration={register("isSmoker")}
          />
        </FormGroup>
      </div>
    </Card>
  );
};
