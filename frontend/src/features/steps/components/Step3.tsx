import React, { useState } from "react";
import { Button, Card } from "components/Elements";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormInputs } from "..";
import { Autocomplete, Suggestion } from "components/Form";
import jobs from "jobs.json";
import { useMemo } from "react";
import Fuse from "fuse.js";

const allSuggestions = jobs.map((job) => ({ id: job[0], value: job[1] }));
const searchOptions = { keys: ["value"], includeMatches: true };
const searchIndex = Fuse.createIndex(searchOptions.keys, allSuggestions);

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
  const [searchTerms, setSearchTerms] = useState<string[]>([""]); // must have a default empty value, because input has one as well
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
    const nextSearchTerms = searchTerms.map((item, itemIndex) => {
      if (index === itemIndex) {
        return value;
      } else {
        return item;
      }
    });
    setSearchTerms(nextSearchTerms);
  };
  const getSuggestions = useMemo(
    () => (index: number, searchTerm: string) => {
      if (searchTerm.length) {
        const fuse = new Fuse(allSuggestions, searchOptions, searchIndex);
        return fuse
          .search(searchTerm)
          .map((result) => ({
            ...result.item,
            matches: result.matches?.[0].indices,
          }))
          .slice(0, 20);
      }
      return allSuggestions;
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
