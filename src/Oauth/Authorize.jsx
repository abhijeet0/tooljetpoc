import React, { useEffect, useState } from "react";
import useRouter from "@/_hooks/use-router";
import { Redirect } from "react-router-dom";
import Configs from "./Configs/Config.json";
import { RedirectLoader } from "../_components";

export function Authorize() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const errorMessage = router.query.error_description || router.query.error;

    if (errorMessage) {
      return setError(errorMessage);
    }

    if (!(router.query.origin && Configs[router.query.origin])) {
      return setError("Login failed");
    }

    const configs = Configs[router.query.origin];
    const authParams = {};

    if (configs.responseType === "hash") {
      if (!window.location.hash) {
        return setError("Login failed");
      }
      const params = new Proxy(
        new URLSearchParams(window.location.hash.substr(1)),
        {
          get: (searchParams, prop) => searchParams.get(prop),
        }
      );
      authParams.token = params[configs.params.token];
      authParams.state = params[configs.params.state];
    } else {
      authParams.token = router.query[configs.params.token];
      authParams.state = router.query[configs.params.state];
    }

    // Disabled for useEffect not being called for updation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <RedirectLoader
        origin={Configs[router.query.origin] ? router.query.origin : "unknown"}
      />
      {(success || error) && (
        <Redirect
          to={{
            pathname: `/login}`,
            state: { errorMessage: error && error },
          }}
        />
      )}
    </div>
  );
}
