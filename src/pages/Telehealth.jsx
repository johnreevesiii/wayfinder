import TelehealthDirectory from '../components/TelehealthDirectory/TelehealthDirectory';

export default function Telehealth() {
  return (
    <div id="main-content" className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="font-heading text-iha-teal text-3xl sm:text-4xl font-bold mb-4">
          Telehealth Directory
        </h1>
        <p className="text-iha-blue/70 text-base max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
          Find IHS, tribal, and urban Indian facilities offering virtual care through phone
          or video visits. Telehealth can be especially helpful for people living in rural or
          remote areas far from a physical facility.
        </p>
      </div>

      <TelehealthDirectory />
    </div>
  );
}
