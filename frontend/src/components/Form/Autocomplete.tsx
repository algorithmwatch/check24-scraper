import { useCallback, useEffect, useMemo, useState } from "react";
import { ChangeHandler, FieldPathValue, UseFormWatch } from "react-hook-form";
import { TextInputProps } from ".";
import { TextInput } from "./TextInput";
import { debounce, DebouncedFunc } from "lodash";

type AutocompleteSuggestion = { id: string; value: string }[];

type AutocompleteProps = TextInputProps & {
  suggestions: AutocompleteSuggestion;
};

const SuggestionsList = ({ list }: { list: AutocompleteSuggestion }) => {
  return list.length ? (
    <div className="relative z-50">
      <ul className="max-h-52 overflow-y-scroll absolute inset-x-0 top-1.5 py-2 w-full bg-white rounded-b-md shadow-md border border-gray-300 ">
        {list.map(({ id, value }) => (
          <li
            key={id}
            className="hover:bg-indigo-100 cursor-pointer px-2.5 py-1.5"
          >
            {value}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div>Keine Ergebnisse</div>
  );
};

export const Autocomplete = ({ suggestions, ...props }: AutocompleteProps) => {
  const [filteredSuggestions, setFilteredSuggestions] =
    useState<AutocompleteSuggestion>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const changeHandler = useCallback(
    (event): Promise<boolean | void> => {
      const userInput = event.target.value;
      console.warn("fire", userInput);

      const unLinked = suggestions.filter(
        (suggestion) =>
          suggestion.value.toLowerCase().indexOf(userInput.toLowerCase()) > -1
      );

      setFilteredSuggestions(unLinked);
      setActiveSuggestionIndex(0);
      setShowSuggestions(true);

      return Promise.resolve();
    },

    [suggestions]
  );
  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 300),
    [changeHandler]
  );

  props.registration.onChange = debouncedChangeHandler as ChangeHandler;

  // destroy debounce handler on unmount
  useEffect(() => {
    return () => debouncedChangeHandler.cancel();
  }, [debouncedChangeHandler]);

  return (
    <div className="w-full">
      <TextInput {...props} className="relative z-0" />
      {showSuggestions && <SuggestionsList list={filteredSuggestions} />}
    </div>
  );
};
