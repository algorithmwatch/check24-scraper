import { useRef, useState, startTransition } from "react";
import { TextInput, TextInputProps } from ".";
import { useOutsideAlerter } from "hooks";

export type Suggestion = { id: string; value: string; matches?: any };
export type SuggestionList = Suggestion[];

type AutocompleteProps = TextInputProps & {
  minChar?: number;
  suggestions: SuggestionList;
  onSelect: (args: Suggestion) => void;
  onChange: (value: string) => void;
};

const highlightText = (inputText: string, regions: number[][]) => {
  // src: https://gist.github.com/evenfrost/1ba123656ded32fb7a0cd4651efd4db0
  // discussion: https://github.com/krisk/Fuse/issues/6
  let content = "";
  let nextUnhighlightedRegionStartingIndex = 0;
  for (let i = 0, l = regions.length; i < l; i++) {
    const region = regions[i];
    const lastRegionNextIndex = region[1] + 1;
    content += [
      inputText.substring(nextUnhighlightedRegionStartingIndex, region[0]),
      "<strong>",
      inputText.substring(region[0], lastRegionNextIndex),
      "</strong>",
    ].join("");
    nextUnhighlightedRegionStartingIndex = lastRegionNextIndex;
  }
  content += inputText.substring(nextUnhighlightedRegionStartingIndex);
  return content;
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
          list.map(({ id, value, matches }) => (
            <li
              key={id}
              className="px-2.5 py-1.5 hover:bg-indigo-100 cursor-pointer"
              onClick={() => onListItemSelect({ id, value })}
              dangerouslySetInnerHTML={{
                __html: highlightText(value, matches),
              }}
            ></li>
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
  const changeHandler = (event: any) => {
    startTransition(() => {
      const term = event.target.value.trim();
      setActiveSuggestionIndex(0);

      if (term.length >= minChar) {
        setSearchTerm(term);
        onChange(term);
        setShowSuggestions(!!term);
      } else {
        setShowSuggestions(false);
      }
    });
    return Promise.resolve();
  };
  const selectHandler = (args: Suggestion) => {
    // setFilteredSuggestions([]);
    setActiveSuggestionIndex(0);
    setShowSuggestions(false);
    onSelect(args);
  };
  const focusHandler = () => {
    if (searchTerm.length && suggestions.length) {
      setShowSuggestions(true);
    }
  };

  props.registration.onChange = changeHandler;

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setShowSuggestions(false));

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
