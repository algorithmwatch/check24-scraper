import * as React from "react";
import { Button, Card } from "components/Elements";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInputs } from "..";
import { Autocomplete, Suggestion } from "components/Form";
import jobs from "jobs.json";
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";

const allSuggestions = jobs.map((job) => ({ id: job[0], value: job[1] }));

export const Step3 = ({
  setNextStep,
  setPreviousStep,
}: {
  setNextStep: () => void;
  setPreviousStep: () => void;
}) => {
  const {
    register,
    control,
    setValue,
    formState: { errors, isValid },
  } = useFormContext<FormInputs>();
  const jobIds = useFieldArray({
    name: "jobIds",
    control,
  });
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const addField = () => {
    jobIds.append({ value: "" });
    setSearchTerms([...searchTerms, ""]);
  };
  const removeField = (index: number) => {
    jobIds.remove(index);
    setSearchTerms(
      searchTerms.filter((item, itemIndex) => itemIndex !== index)
    );
  };
  const selectSuggestion = (index: number, suggestion: Suggestion) =>
    setValue(`jobIds.${index}`, suggestion);
  const updateSearchTerms = (index: number, value: string) => {
    console.warn(searchTerms);
    const nextSearchTerms = searchTerms.map((item, itemIndex) => {
      if (index === itemIndex) {
        return value;
      } else {
        return item;
      }
    });
    setSearchTerms(nextSearchTerms);
    console.warn(nextSearchTerms);
  };
  const getSuggestions = useMemo(
    () => (index: number, searchTerm: string) => {
      // console.count("getSuggestions");

      return searchTerm.length
        ? allSuggestions.filter(
            (suggestion) =>
              suggestion.value.toLowerCase().indexOf(searchTerm.toLowerCase()) >
              -1
          )
        : allSuggestions;
    },
    []
  );

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
        {jobIds.fields.map((item, index) => (
          <div key={item.id} className="flex space-x-2">
            <Autocomplete
              className="flex-grow"
              suggestions={getSuggestions(index, searchTerms[index] || "")}
              registration={register(`jobIds.${index}.value`, {
                // valueAsNumber: true,
              })}
              onSelect={(suggestion) => selectSuggestion(index, suggestion)}
              onChange={(value) => updateSearchTerms(index, value)}
            />

            <Button variant="secondary" onClick={() => removeField(index)}>
              -
            </Button>
            {index === jobIds.fields.length - 1 && (
              <Button variant="secondary" onClick={addField}>
                +
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
