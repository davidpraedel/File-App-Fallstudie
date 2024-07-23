import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonText } from '@ionic/react';
import { folderOutline, documentOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
      setFiles(result.files);
      setCurrentPath(path);
    } catch (err) {
      console.error('Es gab einen Fehler beim Laden der Dateien:', err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

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
      setFiles(result.files);
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
          path: `${currentPath}/${file.name}`,
          data: reader.result,
          directory: Directory.Documents,
          encoding: 'utf-8'
        });

        // Aktualisieren Sie die Dateiliste
        await loadFiles(currentPath);
      };
    } catch (err) {
      console.error('Es gab einen Fehler beim Hinzufügen der Datei:', err);
    }
  };

  const openFile = async (fileName: string) => {
    try {
      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: 'utf-8'
      });

      alert(result.data);
    } catch (err) {
      console.error('Es gab einen Fehler beim Öffnen der Datei:', err);
    }
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dateimanager App</IonTitle>
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