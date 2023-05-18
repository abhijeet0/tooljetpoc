/** @format */

import React, { useEffect, useState } from "react";
import "./PatientDetails.css";
import { Grid, GridColumn } from "@progress/kendo-react-all";
import { process } from "@progress/kendo-data-query";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { toast } from "react-hot-toast";

const initialDataState = {
  sort: [
    {
      field: "code",
      dir: "asc",
    },
  ],
  take: 8,
  skip: 0,
};

function PatientDetails() {
  const [PatientDetailsList, setPatientDetailsList] = useState([]);
  const [dataState, setDataState] = useState(initialDataState);
  const [keysForGrid, setKeysForGrid] = useState([]);
  const [fieldMasterList, setFieldMasterList] = useState([]);
  const history = useHistory();

  function getPatientDetailsList() {
    axios
      .get(
        "https://elabnextapi-dev.azurewebsites.net/api/PatientRegistration/GetPatientRegistration"
      )
      .then((response) => {
        setPatientDetailsList(
          response.data.resultData.patientList.map((patient) => {
            const temp = JSON.parse(patient.patientDescription);
            temp.patientId = patient?.patientId;

            return temp;
          })
        );
      })
      .catch((error) => {
        console.log("error -> getPatientDetailsList", error);
      });
    axios
      .get(
        "https://elabnextapi-dev.azurewebsites.net/api/ReportSetup/GetFieldMaster        "
      )
      .then((response) => {
        setFieldMasterList(response.data.resultData.fieldMaster);
      })
      .catch((error) => {
        console.log("error -> getPatientDetailsList", error);
      });
  }

  useEffect(() => {
    getPatientDetailsList();
  }, []);

  useEffect(() => {
    const temp2 = [];
    PatientDetailsList.map((patient) => {
      const temp = Object.keys(patient);
      temp.map((key) => {
        if (!temp2.includes(key)) {
          temp2.push(key);
        }
      });

      setKeysForGrid(temp2);
    });
  }, [PatientDetailsList]);

  const createGridColumn = (field) => {
    switch (field.componentType) {
      case "TextInput":
        return <GridColumn field={field.value} title={field.label} />;
      case "Datepicker":
        return (
          <GridColumn
            field={field.value}
            title={field.label}
            cell={(props) => {
              const today = new Date(props.dataItem[field.value]);

              const formattedToday = props.dataItem[field.value]
                ? today.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Date Not Entered";

              return <td> {formattedToday} </td>;
            }}
          />
        );
      case "DropDown":
        return (
          <GridColumn
            field={field.value}
            title={field.label}
            cell={(props) => {
              return <td>{props.dataItem[field.value]?.label}</td>;
            }}
          />
        );
      case "RadioButton":
        return (
          <GridColumn
            field={field.value}
            title={field.label}
            cell={(props) => {
              return <td>{props.dataItem[field.value]?.name}</td>;
            }}
          />
        );
      default:
        return <GridColumn field={field.value} title={field.label} />;
    }
  };
  const handleColumnReorder = (event) => {
    console.log("event", event);
  };

  return (
    <div>
      <Grid
        resizable={true}
        pageable={true}
        sortable={true}
        filterable={true}
        reorderable={true}
        data={process(PatientDetailsList, dataState)}
        {...dataState}
        onDataStateChange={(e) => {
          setDataState(e.dataState);
        }}
        onColumnReorder={handleColumnReorder}
        GridEvent={(event) => console.log("eve", event)}
        style={{ height: "90vh" }}
      >
        {keysForGrid?.map((key) => {
          return fieldMasterList.map((field) => {
            if (field.value === key) {
              return createGridColumn(field);
            }
          });
        })}
        <GridColumn
          field="dd"
          title="Actions"
          cell={(props) => {
            return (
              <td>
                {/* <button
                    onClick={() =>
                      history.push({
                        pathname: "/",
                        state: props.dataItem,
                        target: "blank",
                      })
                    }
                  >
                    <span class="k-icon k-i-print"></span>
                  </button>
                  <button
                    onClick={() => {
                      toast.error("Hang on until we developed this");
                    }}
                  >
                    <span class="k-icon k-i-edit"></span>
                  </button> */}
                <button
                  onClick={() =>
                    history.push({
                      pathname: "/result",
                      state: props.dataItem,
                    })
                  }
                >
                  <span class="k-icon k-i-arrow-double-60-right"></span>
                </button>
              </td>
            );
          }}
        />
      </Grid>
    </div>
  );
}

export default PatientDetails;
