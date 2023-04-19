/** @format */

import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";

export const Text = function Text({
  height,
  properties,
  styles,
  darkMode,
  registerAction,
  setExposedVariable,
  dataCy,
  reportTemplateDataMap,
  component,
}) {
  let {
    textSize,
    textColor,
    textAlign,
    backgroundColor,
    fontWeight,
    decoration,
    transformation,
    fontStyle,
    lineHeight,
    textIndent,
    letterSpacing,
    wordSpacing,
    fontVariant,
    disabledState,
  } = styles;
  const { loadingState } = properties;
  const [text, setText] = useState(() => computeText());
  const [visibility, setVisibility] = useState(styles.visibility);
  const color = ["#000", "#000000"].includes(textColor)
    ? darkMode
      ? "#fff"
      : "#000"
    : textColor;

  useEffect(() => {
    if (visibility !== styles.visibility) setVisibility(styles.visibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styles.visibility]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const text = computeText();
    setText(text);
    setExposedVariable("text", text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.text]);

  registerAction(
    "setText",
    async function (text) {
      setText(text);
      setExposedVariable("text", text);
    },
    [setText]
  );
  registerAction(
    "visibility",
    async function (value) {
      setVisibility(value);
    },
    [setVisibility]
  );

  function computeText() {
    return properties.text === 0 || properties.text === false
      ? properties.text?.toString()
      : properties.text;
  }

  const computedStyles = {
    backgroundColor,
    color,
    height,
    display: visibility ? "flex" : "none",
    alignItems: "center",
    textAlign,
    fontWeight: fontWeight ? fontWeight : fontWeight === "0" ? 0 : "normal",
    lineHeight: lineHeight ?? 1.5,
    textDecoration: decoration ?? "none",
    textTransform: transformation ?? "none",
    fontStyle: fontStyle ?? "none",
    fontVariant: fontVariant ?? "normal",
    textIndent: `${textIndent}px` ?? "0px",
    letterSpacing: `${letterSpacing}px` ?? "0px",
    wordSpacing: `${wordSpacing}px` ?? "0px",
    minWidth: "200px",
  };

  function sanitizeString(str) {
    // Remove whitespace
    str = str.replace(/\s+/g, "");

    // Convert all characters to lowercase
    str = str.toLowerCase();

    // Remove special characters
    str = str.replace(/[^\w\s]/gi, "");

    return str;
  }
  // console.log("reportTemplateDataMap", sanitizeString(text));

  function createDynamicValue() {
    console.log("compo in text", component.name);
    console.log(" reportTemplateDataMap", reportTemplateDataMap);
    return "aaaa";
  }

  useEffect(() => {
    createDynamicValue();
  }, []);

  console.log("object", reportTemplateDataMap, component);
  return (
    <div
      data-disabled={disabledState}
      className="text-widget"
      style={computedStyles}
      data-cy={dataCy}
    >
      {!loadingState && (
        <div
          style={{ width: "100%", fontSize: textSize }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              `
           
          
          ${text}  
          
          ${
            reportTemplateDataMap && component
              ? ":" + reportTemplateDataMap[component?.name]
              : ""
          }
          
              `
            ),
          }}
        />
      )}

      {loadingState === true && (
        <div style={{ width: "100%" }}>
          <center>
            <div className="spinner-border" role="status"></div>
          </center>
        </div>
      )}
    </div>
  );
};
