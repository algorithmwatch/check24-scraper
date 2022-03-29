import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChangeHandler } from "react-hook-form";
import { TextInputProps } from ".";
import { TextInput } from "./TextInput";
import { debounce } from "lodash";

export type Suggestion = { id: string; value: string };
export type SuggestionList = Suggestion[];

type AutocompleteProps = TextInputProps & {
  suggestions: SuggestionList;
  onSelect: (args: Suggestion) => void;
  onChange: (value: string) => void;
};

/**
 * Hook that alerts clicks outside of the passed ref
 * credits: https://codesandbox.io/s/outside-alerter-hooks-lmr2y?module=/src/OutsideAlerter.js&file=/src/OutsideAlerter.js:87-679
 */
function useOutsideAlerter(ref: any, cb: Function) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        if (typeof cb === "function") {
          cb();
        }
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, cb]);
}

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
  suggestions,
  onSelect,
  onChange,
  ...props
}: AutocompleteProps) => {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const changeHandler = useCallback(
    (event): Promise<boolean | void> => {
      onChange(event.target.value);
      setActiveSuggestionIndex(0);
      setShowSuggestions(true);

      return Promise.resolve();
    },

    [onChange]
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
    if (suggestions.length) {
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
