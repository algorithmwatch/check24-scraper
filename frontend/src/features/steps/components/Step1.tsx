import React, { useState } from "react";
import { Button, Card } from "components/Elements";

export const Step1 = ({
  setNextStep,
  setPreviousStep,
}: {
  setNextStep: () => void;
  setPreviousStep: () => void;
}) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  if (showMoreInfo) {
    return (
      <Card
        title="Mehr Info"
        center
        footer={<Button onClick={setNextStep}>Mitmachen</Button>}
      >
        <p>Hier steht mehr über das Projekt</p>
      </Card>
    );
  }

  return (
    <Card
      title="Hallo"
      center
      footer={
        <>
          <Button onClick={setNextStep}>Mitmachen</Button>
          <Button
            variant="secondary"
            onClick={() => setShowMoreInfo(!showMoreInfo)}
          >
            Mehr erfahren
          </Button>
        </>
      }
    >
      <p>
        Wir wollen untersuchen, wie sich Berufsbezeichnungen auf den Preis einer
        Risikolebensversicherung auswirken.
      </p>
    </Card>
  );
};
