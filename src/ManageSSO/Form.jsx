import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/_components";

export function Form({ settings, updateData, darkMode }) {
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [
    showDisablingPasswordConfirmation,
    setShowDisablingPasswordConfirmation,
  ] = useState(false);
  const { t } = useTranslation();

  const changeStatus = () => {};

  return (
    <div className="card">
      <ConfirmDialog
        show={showDisablingPasswordConfirmation}
        message={t(
          "manageSSO.DisablingPasswordConfirmation",
          "Users won’t be able to login via username and password if password login is disabled. Please make sure that you have setup other authentication methods before disabling password login, do you want to continue?"
        )}
        onConfirm={() => changeStatus()}
        onCancel={() => setShowDisablingPasswordConfirmation(false)}
        darkMode={darkMode}
      />
      <div className="card-header">
        <div className="d-flex justify-content-between title-with-toggle">
          <div className="card-title" data-cy="card-title">
            {t(
              "header.organization.menus.manageSSO.passwordLogin",
              "Password Login"
            )}
            <span
              className={`badge bg-${enabled ? "green" : "grey"} ms-1`}
              data-cy="status-label"
            >
              {enabled
                ? t("globals.enabled", "Enabled")
                : t("globals.disabled", "Disabled")}
            </span>
          </div>
          <div>
            <label className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={enabled}
                onChange={() =>
                  enabled
                    ? setShowDisablingPasswordConfirmation(true)
                    : changeStatus()
                }
                data-cy="password-enable-toggle"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
