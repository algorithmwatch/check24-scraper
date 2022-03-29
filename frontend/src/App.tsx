import React, { createElement, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormInputs, Step1, Step2, Step3 } from "features/steps";

const Steps = [Step1, Step2, Step3];

function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const methods = useForm<FormInputs>({
    mode: "onChange",
    defaultValues: {
      jobIds: [{ value: "" }],
    },
  });
  const {
    watch,
    register,
    setValue,
    getValues,
    resetField,
    getFieldState,
    formState: { errors, isValid },
  } = methods;

  const setNextStepIndex = () => {
    const lastStepIndex = Steps.length - 1;

    if (stepIndex === lastStepIndex) {
      return;
    }

    setStepIndex(stepIndex + 1);
  };
  const setPreviousStepIndex = () => {
    if (stepIndex === 0) {
      return;
    }

    setStepIndex(stepIndex - 1);
  };

  const handleFormChange = useMemo(
    () => () => {
      // console.warn("test", getValues());
    },
    []
  );

  // watch input change and update
  useEffect(() => {
    const subscription = watch(handleFormChange);
    return () => subscription.unsubscribe();
  }, [handleFormChange, watch]);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-100">
      <div className="max-w-lg w-full mx-auto">
        <FormProvider {...methods}>
          {createElement(Steps[stepIndex], {
            setNextStep: setNextStepIndex,
            setPreviousStep: setPreviousStepIndex,
          })}
        </FormProvider>
      </div>
    </div>
  );
}

export default App;
