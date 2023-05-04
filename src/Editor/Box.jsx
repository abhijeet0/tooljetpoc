/** @format */

import React, { useEffect, useState, useMemo, useContext, useRef } from "react";
import { Button } from "./Components/Button";
import { Image } from "./Components/Image";
import { Text } from "./Components/Text";
import { Table } from "./Components/Table/Table";
import { TextInput } from "./Components/TextInput";
import { NumberInput } from "./Components/NumberInput";
import { DropDown } from "./Components/DropDown";
import { Checkbox } from "./Components/Checkbox";
import { Datepicker } from "./Components/Datepicker";
import { RadioButton } from "./Components/RadioButton";
import { Divider } from "./Components/Divider";
import { renderTooltip, getComponentName } from "@/_helpers/appUtils";
import { ReportResultTable } from "./Components/ReportResultTable/ReportResultTable";
import { VerticalDivider } from "./Components/verticalDivider";
import { TestList } from "./Components/TestList";
import { DemographicField } from "./Components/DemographicField";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import "@/_styles/custom.scss";
import { validateProperties } from "./component-properties-validation";
import { validateWidget } from "@/_helpers/utils";
import { componentTypes } from "./WidgetManager/components";
import {
  resolveProperties,
  resolveStyles,
  resolveGeneralProperties,
  resolveGeneralStyles,
} from "./component-properties-resolution";
import _ from "lodash";
import { EditorContext } from "@/Editor/Context/EditorContextWrapper";
import { useTranslation } from "react-i18next";

const AllComponents = {
  Button,
  Image,
  Text,
  TextInput,
  NumberInput,

  Table,
  DropDown,
  Checkbox,
  Datepicker,
  RadioButton,

  Divider,
  ReportResultTable,
  TestList,
  DemographicField,
  VerticalDivider,
};

export const Box = function Box({
  id,
  width,
  height,
  yellow,
  preview,
  component,
  inCanvas,
  onComponentClick,
  onEvent,
  currentState,
  onComponentOptionChanged,
  onComponentOptionsChanged,
  paramUpdated,
  changeCanDrag,
  containerProps,
  darkMode,
  removeComponent,
  canvasWidth,
  mode,
  customResolvables,
  parentId,
  sideBarDebugger,
  dataQueries,
  readOnly,
  childComponents,
  reportTemplateDataMap,
  PatientRegistrationFormData,
  setPatientRegistrationFormData,
  onSubmitPatientRegistrationFormData,
  customMode,
  testResultData,
}) {
  const { t } = useTranslation();
  const backgroundColor = yellow ? "yellow" : "";

  let styles = {
    height: "100%",
    padding: "1px",
  };

  if (inCanvas) {
    styles = {
      ...styles,
    };
  }

  const componentMeta = useMemo(() => {
    return componentTypes.find(
      (comp) => component.component === comp.component
    );
  }, [component]);

  const ComponentToRender = AllComponents[component.component];
  const [renderCount, setRenderCount] = useState(0);
  const [renderStartTime, setRenderStartTime] = useState(new Date());
  const [resetComponent, setResetStatus] = useState(false);

  const resolvedProperties = resolveProperties(
    component,
    currentState,
    null,
    customResolvables
  );
  const [validatedProperties, propertyErrors] =
    mode === "edit" && component.validate
      ? validateProperties(resolvedProperties, componentMeta.properties)
      : [resolvedProperties, []];

  const resolvedStyles = resolveStyles(
    component,
    currentState,
    null,
    customResolvables
  );
  const [validatedStyles, styleErrors] =
    mode === "edit" && component.validate
      ? validateProperties(resolvedStyles, componentMeta.styles)
      : [resolvedStyles, []];
  validatedStyles.visibility =
    validatedStyles.visibility !== false ? true : false;

  const resolvedGeneralProperties = resolveGeneralProperties(
    component,
    currentState,
    null,
    customResolvables
  );
  const [validatedGeneralProperties, generalPropertiesErrors] =
    mode === "edit" && component.validate
      ? validateProperties(resolvedGeneralProperties, componentMeta.general)
      : [resolvedGeneralProperties, []];

  const resolvedGeneralStyles = resolveGeneralStyles(
    component,
    currentState,
    null,
    customResolvables
  );
  resolvedStyles.visibility =
    resolvedStyles.visibility !== false ? true : false;
  const [validatedGeneralStyles, generalStylesErrors] =
    mode === "edit" && component.validate
      ? validateProperties(resolvedGeneralStyles, componentMeta.generalStyles)
      : [resolvedGeneralStyles, []];

  const { variablesExposedForPreview, exposeToCodeHinter } =
    useContext(EditorContext) || {};

  const componentActions = useRef(new Set());

  useEffect(() => {
    const currentPage = currentState?.page;

    const componentName = getComponentName(currentState, id);
    const errorLog = Object.fromEntries(
      [
        ...propertyErrors,
        ...styleErrors,
        ...generalPropertiesErrors,
        ...generalStylesErrors,
      ].map((error) => [
        `${componentName} - ${error.property}`,
        {
          page: currentPage,
          type: "component",
          kind: "component",
          strace: "page_level",
          data: { message: `${error.message}`, status: true },
          resolvedProperties: resolvedProperties,
          effectiveProperties: validatedProperties,
        },
      ])
    );
    sideBarDebugger?.error(errorLog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify({ propertyErrors, styleErrors, generalPropertiesErrors }),
  ]);

  useEffect(() => {
    setRenderCount(renderCount + 1);
    if (renderCount > 10) {
      setRenderCount(0);
      const currentTime = new Date();
      const timeDifference = Math.abs(currentTime - renderStartTime);
      if (timeDifference < 1000) {
        throw Error;
      }
      setRenderStartTime(currentTime);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ resolvedProperties, resolvedStyles })]);

  useEffect(() => {
    if (customResolvables && !readOnly && mode === "edit") {
      const newCustomResolvable = {};
      newCustomResolvable[id] = { ...customResolvables };
      exposeToCodeHinter((prevState) => ({
        ...prevState,
        ...newCustomResolvable,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(customResolvables), readOnly]);

  useEffect(() => {
    if (resetComponent) setResetStatus(false);
  }, [resetComponent]);

  let exposedVariables = currentState?.components[component.name] ?? {};

  const fireEvent = (eventName, options) => {
    if (mode === "edit" && eventName === "onClick") {
      onComponentClick(id, component);
    }
    onEvent(eventName, {
      ...options,
      customVariables: { ...customResolvables },
      component,
    });
  };
  const validate = (value) =>
    validateWidget({
      ...{ widgetValue: value },
      ...{ validationObject: component.definition.validation, currentState },
      customResolveObjects: customResolvables,
    });

  return (
    <OverlayTrigger
      placement={inCanvas ? "auto" : "top"}
      delay={{ show: 500, hide: 0 }}
      trigger={
        inCanvas && !validatedGeneralProperties.tooltip?.toString().trim()
          ? null
          : ["hover", "focus"]
      }
      overlay={(props) =>
        renderTooltip({
          props,
          text: inCanvas
            ? `${validatedGeneralProperties.tooltip}`
            : `${t(
                `widget.${component.name}.description`,
                component.description
              )}`,
        })
      }
    >
      <div
        style={{
          ...styles,
          backgroundColor,
          boxShadow: validatedGeneralStyles?.boxShadow,
        }}
        role={preview ? "BoxPreview" : "Box"}
      >
        {inCanvas ? (
          !resetComponent ? (
            <ComponentToRender
              onComponentClick={onComponentClick}
              onComponentOptionChanged={onComponentOptionChanged}
              currentState={currentState}
              onEvent={onEvent}
              id={id}
              paramUpdated={paramUpdated}
              width={width}
              changeCanDrag={changeCanDrag}
              onComponentOptionsChanged={onComponentOptionsChanged}
              height={height}
              component={component}
              containerProps={containerProps}
              darkMode={darkMode}
              removeComponent={removeComponent}
              canvasWidth={canvasWidth}
              properties={validatedProperties}
              exposedVariables={exposedVariables}
              styles={validatedStyles}
              setExposedVariable={(variable, value) =>
                onComponentOptionChanged(component, variable, value, id)
              }
              setExposedVariables={(variableSet) =>
                onComponentOptionsChanged(
                  component,
                  Object.entries(variableSet)
                )
              }
              registerAction={(actionName, func, dependencies = []) => {
                if (
                  Object.keys(currentState?.components ?? {}).includes(
                    component.name
                  ) &&
                  currentState?.components[component.name].id === id
                ) {
                  if (!Object.keys(exposedVariables).includes(actionName)) {
                    func.dependencies = dependencies;
                    componentActions.current.add(actionName);
                    return onComponentOptionChanged(
                      component,
                      actionName,
                      func
                    );
                  } else if (
                    exposedVariables[actionName]?.dependencies?.length === 0
                  ) {
                    return Promise.resolve();
                  } else if (
                    JSON.stringify(dependencies) !==
                      JSON.stringify(
                        exposedVariables[actionName]?.dependencies
                      ) ||
                    !componentActions.current.has(actionName)
                  ) {
                    func.dependencies = dependencies;
                    componentActions.current.add(actionName);
                    return onComponentOptionChanged(
                      component,
                      actionName,
                      func
                    );
                  }
                }
              }}
              fireEvent={fireEvent}
              validate={validate}
              parentId={parentId}
              customResolvables={customResolvables}
              dataQueries={dataQueries}
              variablesExposedForPreview={variablesExposedForPreview}
              exposeToCodeHinter={exposeToCodeHinter}
              setProperty={(property, value) => {
                paramUpdated(id, property, { value });
              }}
              mode={mode}
              resetComponent={() => setResetStatus(true)}
              childComponents={childComponents}
              dataCy={`draggable-widget-${String(
                component.name
              ).toLowerCase()}`}
              reportTemplateDataMap={reportTemplateDataMap}
              setPatientRegistrationFormData={setPatientRegistrationFormData}
              PatientRegistrationFormData={PatientRegistrationFormData}
              onSubmitPatientRegistrationFormData={
                onSubmitPatientRegistrationFormData
              }
              customMode={customMode}
              testResultData={testResultData}
            ></ComponentToRender>
          ) : (
            <></>
          )
        ) : (
          <div
            className="m-1"
            style={{
              height: "76px",
              width: "76px",
              marginLeft: "18px",
            }}
          >
            <div
              className="component-image-holder p-2 d-flex flex-column justify-content-center"
              style={{ height: "100%" }}
              data-cy={`widget-list-box-${component.displayName
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <center>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundSize: "contain",
                    backgroundImage: `url(assets/images/icons/widgets/${component.name.toLowerCase()}.svg)`,
                    backgroundRepeat: "no-repeat",
                  }}
                ></div>
              </center>
              <span className="component-title">
                {t(`${component.name}`, component.displayName)}
              </span>
            </div>
          </div>
        )}
      </div>
    </OverlayTrigger>
  );
};
