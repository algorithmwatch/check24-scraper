import React, { ReactNode } from "react";
import clsx from "clsx";

export const Card = ({
  title,
  children,
  footer,
  center = false,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  center?: boolean;
}) => {
  return (
    <div className="bg-white shadow rounded-lg mx-2 sm:mx-0 p-4 sm:p-6">
      {title && (
        <h1
          className={clsx(
            { "text-center": center },
            "text-2xl font-medium mb-1"
          )}
        >
          {title}
        </h1>
      )}
      <div className={clsx({ "text-center": center })}>{children}</div>
      {footer && (
        <div className="flex flex-col space-y-4 rounded-b-lg p-4 sm:p-6 mt-4 sm:mt-6 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6  bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};
