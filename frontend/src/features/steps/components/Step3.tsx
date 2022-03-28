import * as React from "react";
import { Button, Card } from "components/Elements";
import { useFormContext } from "react-hook-form";
import { FormInputs } from "..";

export const Step3 = ({
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
        Nun ist deine Kreativität gefragt. Gebe so viele Bezeichnungen für
        deinen Beruf ein, wie dir einfallen. Wenn du fertig bist, klicke auf
        “Absenden”.
      </p>
    </Card>
  );
};
