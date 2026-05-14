export default function ConfidentialitePage() {
  return (
    <>
      <h2 className="text-3xl text-center font-bold">
        Politique de confidentialité
      </h2>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">1. Présentation</h3>
        <p className="text-justify">
          BlaBlaBook est une application web de gestion de bibliothèque
          personnelle réalisée dans le cadre d’une formation professionnelle.
        </p>
        <p className="text-justify">
          Cette politique de confidentialité présente de façon simple les
          données utilisées pour le fonctionnement du projet.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">2. Données collectées</h3>
        <p className="text-justify">
          Lors de l’utilisation du service, BlaBlaBook peut collecter l’adresse
          email, le nom d’utilisateur et les informations liées aux livres
          ajoutés à la bibliothèque personnelle.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">3. Utilisation des données</h3>
        <p className="text-justify">
          Les données sont utilisées uniquement pour permettre la création d’un
          compte, la connexion et la gestion de la bibliothèque de l’utilisateur.
        </p>
        <p className="text-justify">
          Elles ne sont pas revendues ni utilisées à des fins commerciales.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">4. Sécurité</h3>
        <p className="text-justify">
          Les mots de passe sont stockés de manière sécurisée et ne sont pas
          conservés en clair.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">5. Durée de conservation</h3>
        <p className="text-justify">
          Les données sont conservées tant que le compte utilisateur existe ou
          jusqu’à leur suppression dans le cadre du projet.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">6. Droits de l’utilisateur</h3>
        <p className="text-justify">
          L’utilisateur peut demander l’accès, la modification ou la suppression
          de ses données personnelles.
        </p>
      </div>
    </>
  );
}
