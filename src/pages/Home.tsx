import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/react';
import { folderOutline, documentOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

const Home: React.FC = () => {
  //beispiel Daten
  const [files, setFiles] = useState<string[]>([]);

  //Daten laden
  //Daten laden
const loadFiles = async () => {
  try {
    const result = await Filesystem.readdir({
      path: '',
      directory: Directory.Documents
    });
    console.log('Dateien geladen:', result);
    setFiles(result.files);
  } catch (err) {
    console.error('Es gab einen Fehler beim Laden der Dateien:', err);
  }
};

useEffect(() => {
  loadFiles();
}, []);

const addFolder = async () => {
  const folderName = prompt('Geben Sie den Namen des neuen Ordners ein');
  if (folderName) {
    await Filesystem.mkdir({
      path: folderName,
      directory: Directory.Documents
    });
    // Aktualisieren Sie die Dateiliste
    const result = await Filesystem.readdir({
      path: '',
      directory: Directory.Documents
    });
    setFiles(result.files);
  }
};

const addFile = async () => {
  try {
    // Öffnen Sie den Dateiauswahldialog
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();

    // Lesen Sie die Datei als Text
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      // Kopieren Sie die Datei in das App-Verzeichnis
      await Filesystem.writeFile({
        path: file.name,
        data: reader.result,
        directory: Directory.Documents,
        encoding: 'utf-8'
      });

      // Aktualisieren Sie die Dateiliste
      await loadFiles();
    };
  } catch (err) {
    console.error('Es gab einen Fehler beim Hinzufügen der Datei:', err);
  }
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dateimanager App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton onClick={addFolder}>Ordner hinzufügen</IonButton>
        <IonButton onClick={addFile}>Datei hinzufügen</IonButton>
        <IonList>
  {files.map((file, index) => (
    <IonItem key={index}>
      <IonIcon icon={file.type === 'directory' ? folderOutline : documentOutline} slot="start" />
      <IonLabel>{file.name}</IonLabel>
    </IonItem>
  ))}
</IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;