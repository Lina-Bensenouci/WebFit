import React, { useEffect, useImperativeHandle, forwardRef } from "react";

const GoogleLogin = forwardRef(({ onSuccess }, ref) => {
  
  useImperativeHandle(ref, () => ({
    prompt: () => {
      if (window.google) {
        // Déclenche directement le bouton invisible pour ouvrir la fenêtre classique
        const googleBtn = document.querySelector('div[id="google-hidden-btn"] div[role="button"]');
        if (googleBtn) {
          googleBtn.click();
        }
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
          use_fedcm_for_prompt: true 
        });

        // On crée le bouton mais on le cache
        window.google.accounts.id.renderButton(
          document.getElementById("google-hidden-btn"),
          { theme: "outline", size: "large" } 
        );
      }
    };

    const handleCallbackResponse = (response) => {
      try {
        // Décodage des infos utilisateur (Nom, Photo, Email)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        const userObject = JSON.parse(jsonPayload);
        
        onSuccess({
          nom: userObject.name,
          photo: userObject.picture,
          email: userObject.email,
          token: response.credential 
        });
      } catch (error) {
        console.error("Erreur décodage:", error);
      }
    };

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

  // Le bouton est là mais invisible pour l'utilisateur
  return <div style={{ display: "none" }} id="google-hidden-btn"></div>; 
});

export default GoogleLogin;