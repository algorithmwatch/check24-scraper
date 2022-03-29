import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChangeHandler } from "react-hook-form";
import { TextInput, TextInputProps } from ".";
import { debounce } from "lodash";
import { useOutsideAlerter } from "hooks";

export type Suggestion = { id: string; value: string };
export type SuggestionList = Suggestion[];

type AutocompleteProps = TextInputProps & {
  minChar?: number;
  suggestions: SuggestionList;
  onSelect: (args: Suggestion) => void;
  onChange: (value: string) => void;
};

const SuggestionsList = ({
  list,
  onListItemSelect,
}: {
  list: SuggestionList;
  onListItemSelect: (args: Suggestion) => void;
}) => {
  return (
    <div className="relative z-50">
      <ul className="max-h-52 overflow-y-scroll absolute inset-x-0 top-1.5 py-2 w-full bg-white rounded-b-md shadow-md border border-gray-300 ">
        {list.length ? (
          list.map(({ id, value }) => (
            <li
              key={id}
              className="px-2.5 py-1.5 hover:bg-indigo-100 cursor-pointer"
              onClick={() => onListItemSelect({ id, value })}
            >
              {value}
            </li>
          ))
        ) : (
          <li className="px-2.5 py-1.5 italic text-gray-500">
            Keine Ergebnisse
          </li>
        )}
      </ul>
    </div>
  );
};

export const Autocomplete = ({
  minChar = 2,
  suggestions,
  onSelect,
  onChange,
  ...props
}: AutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const changeHandler = useCallback(
    (event): Promise<boolean | void> => {
      const term = event.target.value.trim();
      setActiveSuggestionIndex(0);

      if (term.length >= minChar) {
        setSearchTerm(term);
        onChange(term);
        setShowSuggestions(!!term);
      } else {
        setShowSuggestions(false);
      }

      return Promise.resolve();
    },

    [minChar, onChange]
  );
  const selectHandler = (args: Suggestion) => {
    // setFilteredSuggestions([]);
    setActiveSuggestionIndex(0);
    setShowSuggestions(false);
    onSelect(args);
  };
  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 300),
    [changeHandler]
  );
  const focusHandler = () => {
    if (searchTerm.length && suggestions.length) {
      setShowSuggestions(true);
    }
  };

  props.registration.onChange = debouncedChangeHandler as ChangeHandler;

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setShowSuggestions(false));

  // destroy debounce handler on unmount
  useEffect(() => {
    return () => debouncedChangeHandler.cancel();
  }, [debouncedChangeHandler]);

  console.warn(suggestions.length);

  return (
    <div className="w-full" ref={wrapperRef}>
      <TextInput
        {...props}
        className="relative z-0"
        autoComplete="off"
        onFocus={focusHandler}
      />
      {showSuggestions && (
        <SuggestionsList list={suggestions} onListItemSelect={selectHandler} />
      )}
    </div>
  );
};
