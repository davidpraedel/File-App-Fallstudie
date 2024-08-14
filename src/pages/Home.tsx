import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonText } from '@ionic/react';
import { folderOutline, documentOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';
import { FilePicker } from '@capawesome/capacitor-file-picker';

const Home: React.FC = () => {
  // Beispiel Daten
  const [files, setFiles] = useState<{ name: string, type: string }[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  const loadFiles = async (path = '') => {
    try {
      const result = await Filesystem.readdir({
        path,
        directory: Directory.Data,
      });

      const filesWithTypes = result.files.map(file => ({
        name: file.name,
        type: file.type === 'directory' ? 'directory' : 'file',
      }));

      setFiles(filesWithTypes);
      setCurrentPath(path);
    } catch (error) {
      console.error("Fehler beim Laden der Dateien:", error);
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
      setFiles(result.files);
    }
  };



  const deleteFile = async (fileName: string) => {
    try {
      const fullPath = `${currentPath}/${fileName}`;

      await Filesystem.deleteFile({
        path: fullPath,
        directory: Directory.Data,
      });
      loadFiles(currentPath); // Aktualisiere die Dateiliste nach dem Löschen
    } catch (error) {
      console.error("Fehler beim Löschen der Datei:", error);
    }
  };

  const addFile = async () => {
    try {
      const result = await FilePicker.pickFiles({
        readData: true,  // Ermöglicht das Lesen der Datei als Base64
      });
  
      if (result && result.files && result.files.length > 0) {
        const file = result.files[0];  // Nehmen wir nur die erste ausgewählte Datei
  
        // Speichern Sie die Datei im Verzeichnis
        await Filesystem.writeFile({
          path: `${currentPath}/${file.name}`,
          data: file.data,  // Verwenden Sie die Base64-Daten direkt
          directory: Directory.Data,
        });
  
        // Aktualisieren Sie die Dateiliste
        loadFiles(currentPath);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Datei:", error);
    }
  };
  

  const openFile = async (fileName: string) => {
    try {
      const filePath = `${currentPath}/${fileName}`;
  
      // Der Dateipfad wird aus dem Verzeichnis ermittelt
      const { uri } = await Filesystem.getUri({
        path: filePath,
        directory: Directory.Data,
      });
  
      // Datei öffnen
      await FileOpener.openFile({ path: uri });
      console.log('Datei geöffnet:', filePath);
    } catch (error) {
      console.error('Fehler beim Öffnen der Datei:', error);
    }
  };
  



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
              <IonLabel onClick={() => file.type === 'directory' ? loadFiles(`${currentPath}/${file.name}`) : openFile(`${currentPath}/${file.name}`)}>
                {file.name}
              </IonLabel>
              <IonButton slot="end" onClick={() => deleteFile(file.name)}>Löschen</IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
