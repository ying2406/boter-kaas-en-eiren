# Boter, Kaas en Eieren
def print_bord(bord):
    for rij in bord:
        print(" | ".join(rij))
        print("-" * 9)

def check_winnaar(bord, speler):
    # Controleer rijen, kolommen en diagonalen
    for rij in bord:
        if all(vak == speler for vak in rij):
            return True
    for col in range(3):
        if all(bord[rij][col] == speler for rij in range(3)):
            return True
    if all(bord[i][i] == speler for i in range(3)) or all(bord[i][2-i] == speler for i in range(3)):
        return True
    return False

def main():
    bord = [[" " for _ in range(3)] for _ in range(3)]
    spelers = ["X", "O"]
    beurt = 0
    
    print("Welkom bij Boter, Kaas en Eieren!")
    while True:
        print_bord(bord)
        huidige_speler = spelers[beurt % 2]
        print(f"Speler {huidige_speler}, jouw beurt.")
        
        try:
            rij = int(input("Kies een rij (0, 1, 2): "))
            kolom = int(input("Kies een kolom (0, 1, 2): "))
            if bord[rij][kolom] != " ":
                print("Deze plek is al bezet, kies een andere!")
                continue
        except (ValueError, IndexError):
            print("Ongeldige invoer, probeer opnieuw.")
            continue
        
        bord[rij][kolom] = huidige_speler
        
        if check_winnaar(bord, huidige_speler):
            print_bord(bord)
            print(f"Gefeliciteerd! Speler {huidige_speler} heeft gewonnen!")
            break
        
        if all(vak != " " for rij in bord for vak in rij):
            print_bord(bord)
            print("Het is een gelijkspel!")
            break
        
        beurt += 1

if __name__ == "__main__":
    main()
