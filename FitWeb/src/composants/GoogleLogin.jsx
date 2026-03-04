import React, { useEffect, useImperativeHandle, forwardRef } from "react";

const GoogleLogin = forwardRef(({ onSuccess }, ref) => {
  
  // Permet au parent d'appeler la fonction prompt() manuellement
  useImperativeHandle(ref, () => ({
    prompt: () => {
      if (window.google) {
        // On simule un clic sur le vrai bouton Google caché dans notre div
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
    // Config de base de l'API Google
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "338498208696-blf1m0mpo43s3ebq6ntpsadbitp3n2mu.apps.googleusercontent.com",
          callback: handleCallbackResponse, // La fonction à lancer après la connexion
          use_fedcm_for_prompt: true 
        });

        // On génère le bouton officiel de Google dans notre div cachée
        window.google.accounts.id.renderButton(
          document.getElementById("google-hidden-btn"),
          { theme: "outline", size: "large" } 
        );
      }
    };

    // Pour décoder le jeton (token) renvoyé par Google
    const handleCallbackResponse = (response) => {
      try {
        // Le token est un JWT, on récupère la partie du milieu (payload)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // On transforme le base64 en JSON lisible
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

        const userObject = JSON.parse(jsonPayload);
        
        // On renvoie les infos propres au composant parent
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

    // Charge le script Google SDK si il n'est pas déjà sur la page
    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle; // Initialise une fois chargé
      document.head.appendChild(script);
    } else {
      initializeGoogle(); // Déjà là, on initialise direct
    }
  }, [onSuccess]);

  // Conteneur du bouton Google, mis en display: none car on veut le déclencher nous-même
  return <div style={{ display: "none" }} id="google-hidden-btn"></div>; 
});

export default GoogleLogin;