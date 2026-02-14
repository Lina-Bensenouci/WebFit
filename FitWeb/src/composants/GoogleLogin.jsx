import React, { useEffect, useImperativeHandle, forwardRef } from "react";

const GoogleLogin = forwardRef(({ onSuccess }, ref) => {
  
  useImperativeHandle(ref, () => ({
    prompt: () => {
      if (window.google) {
        // Déclenche l'affichage du sélecteur de compte Google
        window.google.accounts.id.prompt();
      } else {
        console.error("Google API non chargée");
      }
    }
  }));

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "338498208696-blf1m0mpo43s3ebq6ntpsadbitp3n2mu.apps.googleusercontent.com",
          callback: handleCallbackResponse,
          // Changé à false pour éviter les blocages (cool down) répétitifs en dev
          use_fedcm_for_prompt: false, 
          itp_support: true,
          auto_select: false // Évite de connecter l'utilisateur sans clic
        });
      }
    };

    const handleCallbackResponse = (response) => {
      // Décodage du JWT renvoyé par Google pour extraire les infos utilisateur
      const userObject = JSON.parse(atob(response.credential.split('.')[1]));
      
      onSuccess({
        nom: userObject.name,
        photo: userObject.picture,
        email: userObject.email,
        token: response.credential 
      });
    };

    // Chargement dynamique du script Google Identity Services
    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [onSuccess]);

  return null; 
});

export default GoogleLogin;