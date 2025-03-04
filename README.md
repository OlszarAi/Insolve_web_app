
# Opis
## Krok 1
#### Do ustawienia parametry naklejki
- szerokość, wysokość
- jednostki
- granica od krawędźi przyda się w następnym kroku)

###
## Krok 2
#### Okienko z podglądem
- można przeciągać obiekty myszką(troche nieudolnie(trzeba kliknąć w obiekt aby się podświetlił następnie wybrać jego kolalizację))
- border padding - nie pozwala obiektowi wyjsc za granice
- Element Spacing - odległość pomiedzy obkietami by na siebnie nie nachodziły(funkcja w zamyśle dobra, lecz nie jest  dopracowana)

#### Ręczne ustawianie parametrów
- Zmiana pozycji, skali przez wpisanie parametrów
- 2 Błedy które występuja (przy wpisywaniu aplikacja akceptuje odrazu liczbe, trzeba kliknąć i wpisac kolejna-> do poprawy, dostępne przesuwanie skalowanie strzałkami)
- Przy Company Name oraz Product Name  dostępne wyrównanie tekstu (BŁĄD -> wyrównanie tekstu z parametrem CENTER(inne dobrze działają) w połączniu z zawijaniem(multiline) dobrze działa na podglądznie, lecz przy eksporcie pdf tekst nie jest w prawidłowym miejscu(wiem na czym polega błąd)

###
## Krok 3
#### Inne ustawienia
- Do wpisania nazwa firmy

- UUID Settings -> wpiswyanie prefixu dodanego do QR Code np: https://nazwastrony/
- długosc UUID 
- Number of labels -> ilość wygenerowanych naklejek

## Ostatni krok
#### Podgląd wygenerowanych naklejek
- funkcja wpisywania nazwy naklejki osobno
- przy zaznaczeniu kilku naklejek mozemy edytowac wygląd tylko zaznaczonych naklejek
- edycja wybranej naklejki
- export do pdf (bez zaznaczenia wszystkie, z zaznaczeniem tylko zaznaczone)
## Do poprawy

- tworzenie kilkunastu naklejek na jednej stronie(totalnie do zmiany i poprawy)
- pdf rozni sie od wzoru (czcionki, grubosc znaków)
- pozycja rzeczy na pdf jest dobra za wyjatkiem jednego ustawienia gdy wlaczymy zawijanie tekstu z pramametrem centrowania go (w przypadku text align left/right) jest dobrze
- podczas edycjii nakleji jest dziwny blad: wpisujac cyfry w pole tekstowe aplikacja odrazu akceptuje pierwszy cyfre(trzeba znow kliknac w pole i dospiac lub graficznie dodac)
-


## Do dodania

- na stronie startowej wzory naklejek (dodawanie wlasnych) zeby uzytkownik nie musial zawsze robic od zera
- wlaczenie mozliwosci generowania aktualnej daty na naklejce
- customowe czcionki
- wpisywanie tej samej nazwy do kilku naklejek na ostatniej stronie


## Web App

Install

```bash
  npm install
  npm run dev
```


    
