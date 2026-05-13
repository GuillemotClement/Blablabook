export default function CguPage() {
  return (
    <>
      <h2 className="text-3xl text-center font-bold">
        Conditions Générales d’Utilisation (CGU)
      </h2>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">1. Présentation du service</h3>
        <p className="text-justify">
          BlaBlaBook est une application web de gestion et de suivi de
          bibliothèque personnelle permettant aux utilisateurs de rechercher,
          enregistrer et organiser des ouvrages numériques.
        </p>
        <p className="text-justify">
          Ce projet est réalisé dans le cadre d’une formation professionnelle et
          a une vocation pédagogique et démonstrative.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">2. Accès au service</h3>
        <p className="text-justify">
          L’accès au service est gratuit et accessible via une connexion
          internet.
        </p>
        <p className="text-justify">
          Certaines fonctionnalités nécessitent la création d’un compte
          utilisateur.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">3. Compte utilisateur</h3>
        <p className="text-justify">
          L’utilisateur s’engage à fournir des informations exactes lors de son
          inscription.
        </p>
        <p className="text-justify">
          Il est responsable de la confidentialité de ses identifiants de
          connexion ainsi que des actions réalisées depuis son compte.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">4. Données personnelles</h3>
        <p className="text-justify">
          BlaBlaBook collecte certaines données nécessaires au fonctionnement du
          service, notamment l’adresse email, le nom d’utilisateur et les
          informations liées à la bibliothèque personnelle.
        </p>
        <p className="text-justify">
          Les mots de passe sont stockés de manière sécurisée et ne sont jamais
          conservés en clair.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">5. Disponibilité du service</h3>
        <p className="text-justify">
          Le service est fourni sans garantie de disponibilité permanente.
        </p>
        <p className="text-justify">
          L’éditeur ne pourra être tenu responsable d’une interruption
          temporaire, d’une perte de données ou d’un dysfonctionnement
          technique.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">6. Propriété intellectuelle</h3>
        <p className="text-justify">
          Les contenus affichés via des API tierces restent la propriété de
          leurs auteurs et fournisseurs respectifs.
        </p>
        <p className="text-justify">
          Le code source, l’interface et les éléments graphiques de BlaBlaBook
          restent la propriété de leur auteur.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">7. Responsabilité</h3>
        <p className="text-justify">
          L’utilisateur reste responsable de l’utilisation qu’il fait du
          service.
        </p>
        <p className="text-justify">
          Le projet étant réalisé dans un cadre pédagogique, aucune garantie
          commerciale n’est fournie.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">8. Hébergement</h3>
        <p className="text-justify">
          Le service est hébergé sur un serveur VPS administré par l’éditeur du
          projet.
        </p>
      </div>

      <div className="my-3">
        <h3 className="text-xl bold mb-2">9. Modification des CGU</h3>
        <p className="text-justify">
          Les présentes conditions générales d’utilisation peuvent être
          modifiées à tout moment afin d’améliorer le service ou de respecter
          les évolutions légales et techniques.
        </p>
      </div>

      {/* <div className="my-3">
        <h3 className="text-xl bold mb-2">10. Contact</h3>
        <p className="text-justify">
          Pour toute question relative au projet BlaBlaBook, l’utilisateur peut
          contacter l’éditeur via les informations de contact mises à
          disposition sur le site.
        </p>
      </div> */}
    </>
  );
}
