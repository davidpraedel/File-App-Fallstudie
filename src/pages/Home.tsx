import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonText } from '@ionic/react';
import { folderOutline, documentOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { FilePicker } from '@capawesome/capacitor-file-picker';

const Home: React.FC = () => {
  //beispiel Daten
  const [files, setFiles] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  const loadFiles = async (path = '') => {
    try {
      const result = await Filesystem.readdir({
        path: path,
        directory: Directory.Documents
      });
      setFiles(result.files.map(file => file.name));
      setCurrentPath(path);
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
        path: `${currentPath}/${folderName}`,
        directory: Directory.Documents
      });
      // Aktualisieren Sie die Dateiliste
      const result = await Filesystem.readdir({
        path: `${currentPath}`,
        directory: Directory.Documents
      });
      setFiles(result.files.map(file => file.name));
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      const file = files.find(file => file.name === fileName);

      if (file.type === 'directory') {
        const result = await Filesystem.readdir({
          path: `${currentPath}/${fileName}`,
          directory: Directory.Documents
        });

        if (result.files.length > 0) {
          alert('Der Ordner ist nicht leer und kann nicht gelöscht werden.');
          return;
        }
      }

      await Filesystem.deleteFile({
        path: `${currentPath}/${fileName}`,
        directory: Directory.Documents
      });

      // Aktualisieren Sie die Dateiliste
      await loadFiles(currentPath);
    } catch (err) {
      console.error('Es gab einen Fehler beim Löschen der Datei:', err);
    }
  };


  async function addFile() {
    const result = await FilePicker.pickFiles({
      types: ['image/png'],
    });
    const file = result.files[0];
  
    if (file.blob) {
      const rawFile = new File([file.blob], file.name, {
        type: file.mimeType,
      });
      console.log(rawFile);

      await Filesystem.writeFile({
        path: `${currentPath}/${file.name}`,
        data: rawFile,
        directory: Directory.Documents,
     //   encoding: 'utf8',
      });
    }
    await loadFiles(currentPath);
  }


  async function openFile(path: string) {
    try {
      // Datei vom Filesystem-Plugin lesen
      const result = await Filesystem.readFile({
        path: path,
        directory: Directory.Documents
      });
  
      const base64Data = result.data;
  
      // Temporäre Datei mit Filesystem-Plugin schreiben, um diese zu öffnen
      const tempPath = `temp_${path}`;
      const tempUri = await Filesystem.getUri({ path: tempPath, directory: Directory.Cache });
      await Filesystem.writeFile({
        path: tempPath,
        data: base64Data,
        directory: Directory.Cache
      });

      // Datei mit dem FileOpener-Plugin öffnen
      await FileOpener.openFile({
        path: tempUri.uri,
      });

      console.log('File opened successfully!');
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }
  


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle></IonTitle>
          <IonText color="medium" style={{ paddingLeft: '10px' }}>
            Pfad: <strong>{currentPath}</strong>
          </IonText>
          <IonButtons slot="end">
            <IonButton onClick={() => loadFiles(currentPath.substring(0, currentPath.lastIndexOf('/')))}>Zurück</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <IonButton onClick={addFolder}>Ordner hinzufügen</IonButton>
        <IonButton onClick={addFile}>Datei hinzufügen</IonButton>

        <IonList>
          {files.map((file, index) => (
            <IonItem key={index}>
              <IonIcon icon={file.type === 'directory' ? folderOutline : documentOutline} slot="start" />
              <IonLabel onClick={() => file.type === 'directory' ? loadFiles(`${currentPath}/${file.name}`) : openFile(`${currentPath}/${file.name}`)}>{file.name}</IonLabel>
              <IonButton slot="end" onClick={() => deleteFile(file.name)}>Löschen</IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;