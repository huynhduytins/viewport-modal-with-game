import styles from "./App.module.css";
import { Dialog } from "./components/Dialog";
import DialogContent from "./components/DialogContent";

function App() {
  return (
    <main>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          <img src="./logo.png" className={styles.logo} />
          <span className={styles.cheers}>Bubbles Cheers!!!</span>
        </h1>
        <div className={styles.desc}>a game for entrance test</div>
        <Dialog
          target={({ open }) => (
            <button className={styles.button} onClick={open}>
              Play!
            </button>
          )}
        >
          {({ isSmallViewPort, responsivePoint }) => (
            <DialogContent
              isSmallViewPort={isSmallViewPort}
              responsivePoint={responsivePoint}
            />
          )}
        </Dialog>
      </div>
      <footer className={styles.footer}>© hduytins 2024</footer>
    </main>
  );
}

export default App;
