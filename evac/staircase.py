# === Modelowanie kolejki na klatce schodowej ===
import numpy.random as random
from math import ceil
from itertools import compress

"""
Importowanie niezbędnych modułów:<br>
    numpy.random -generowanie losowych liczb,<br>
    math.ceil -zaokrąglanie liczby do liczby całkowitej w górę.
"""
class Queue:
    """
    <b>Klasa Queue</b> (kolejka) reprezentuje bieg schodów o szerokości jednej osoby. Używana jest kilukrotnie w klasie Staircase
    (klatka schodowa), by zwirtualizować wygląd klatki schodowej. Dana kolejka jest zmodyfikowaną wersją kolejki FIFO (first in
     - first out), gdzie pierwszy dodany element jest usuwany również jako pierwszy, gdyż istnieje możliwość dodania (funkcje add, insert)
    do kolejki na różnych piętrach. Z kolejki usuwani są agenci (funkcje pop, only_pop),a także puste pola (funkcja pop_none). Istnieje 
    możliwość sprawdzenia czy dany agent znajduje się w kolejce (funkcja check_if_in_que), zwrócenie miejsca w którym się znajduje
    (funkcja give_index),jak również obliczania jak długo agent znajduje się w kolejce, na jakiej  jest pozycji i czy opuścił kolejkę
    (funkcja count, count_completed). 
    """
    def __init__(self, name: str, floors: int, floor_space: int):# {{{
        """
        Generując daną kolejkę przypisywana jest jej nazwa (name), 
        liczba pięter - wysokość kolejki (floor), ilość miejsc między piętrami (floor_space). Tworzony jest wskaźnik określający czy nastąpiło przesunięcie,
        licznik poszczególnych agentów, a także formowana jest sama kolejka wypełniona pustymi polami. 
        """
        self.name = name
        self.floors = floors
        self.floor_space = floor_space
        self.moved = False
        self.counter = {}
        self.queue = (floors*floor_space)*[None]# }}}
    def __repr__(self):# {{{
        """<b>Funkcja __repr__ </b> zwraca nazwę danej kolejki """
        return str(self.name)+"-queue"# }}}
    def __len__(self):# {{{
        """<b>Funkcja __len__</b> zwraca długość danej kolejki """
        return len(self.queue)# }}}
    def __getitem__(self, key):
        return self.queue[key]
    def __setitem__(self, key, value):
        self.queue[key] = value
    def get_rand(self):
            return random.randint(0,3)
    def get_in(self, position, agent_id):
        self.queue[position] = agent_id
        self.counter[agent_id] = {"added_at":position,
                                "cur_pos":position, "steps":0, 
                                "finished":0, "id":agent_id}
    def add(self, position, agent_id):# {{{
        """
        <b>Funkcja add</b> pobiera parametry:<br>
        floor -numer piętra na którym dodany ma być agent, <br>
        agent_id -identyfikator danego agenta<br>
        W momencie dodawania funkcja sprawdza czy miejsce do którego
        ma być dodany agent jest wolne oraz czy komórka powyżej jest pusta,
        gdy warunki są spełnione funkcja wstawia agenta do kolejki, zapisuje 
        jego miejsce dodania, zwraca 1. <br>
        Jeżeli komórka do której agent chce zostać dodany jest wolna lecz inny agent schodzi
        z góry następuje losowanie miejsca między nimi w proporcji 1 do 3, gdy dodawany agent 
        wylosuje miejsce, jak we wcześniejszym przypadku wstawiany jest do kolejki, zapisywane 
        jest jego miejsce dodania, zwracana jest wartość 1.<br>
        Jeżeli komórka do której agent chce zostać dodany jest zajęta również następuje
        losowanie 1 do 3 z agentem przebywającym w kolejce, gdy dodawany agent wygra, funkcja
        dodaje go do kolejki i zwraca wartość 2.<br>
        W przypadku nie dodania agenta do kolejki funkcja zwraca 0.
        """   
        if self.moved:
            if position != 0:
                position += 1
        if self.queue[position] is None:
            if position == len(self.queue)-1:
                self.get_in(position, agent_id)
                return 1
            if self.queue[position+1] is None:
                self.get_in(position, agent_id)                
                return 1
            else:
                if not random.randint(0,3):
                    self.get_in(position, agent_id)  
                    return 1
                else:
                    return 0
        else:
            if not random.randint(0,3):
                if not self.moved:
                    return 2
                    # if self.can_move_in_next_step(position):
                    #     return 2
                    # else:
                    #     return 0
                else:
                    return 0
            else:
                return 0# }}}
    def insert(self, position, agent_id):# {{{
        """
        <b>Funkcja insert</b> pobierająca parametry:<br>
        floor -numer piętra na którym dodany ma być agent, <br>
        agent_id -identyfikator danego agenta<br>
        Stosowana jest w przypadku gdy agent wylosuje dostanie się do kolejki, 
        w której nie ma wolnego miejsca. Funkcja zmienia wartość wskaźnika
        przesunięcia kolejki, wstawia agenta do kolejki oraz zapisuje 
        jego miejsce dodania.
        """
        self.moved = True
        self.queue.insert(position, agent_id)
        self.counter[agent_id] = {"added_at":position, 
                                    "cur_pos":position, "steps":0, 
                                    "finished":0, "id":agent_id}# }}}
    def pop(self):# {{{
        """
        <b>Funckja pop</b> usuwa pierwszy element z kolejki i dodaje puste pole
        na końcu w celu zachowania stałej wielkości kolejki. W przypadku gdy
        usuself.q1[9] = "agent"wany jest agent, zapisywany jest fakt ukończenia kolejki, funkcja zwraca True.
        Gdy usuwane jest puste miejsce funkcja zwraca False.
        """
        data = self.queue.pop(0)
        self.queue.append(None)
        if data is not None:
            self.counter.get(data, {})["finished"] = 1
            return data
        return False# }}}
    def pop_none(self):# {{{
        """
        <b>Funkcja pop_none</b> w sytuacji gdy na pierwszym miejscu nie znajduje się 
        agent, usuwa pierwszą komórkę i dodaje pustą na końcu aby agenci przesunęli 
        się o jedną pozycję do przodu. Gdy pierwszy jest agent funkcja przeszukuje 
        kolejkę, gdy znajdzie wolną komórkę usuwa ją.
        """
        if self.queue[0] is None:
            self.queue.pop(0)
            self.queue.append(None)
            return True
        else:
            if self.only_pop_none():
                self.queue.append(None)
                return True
            return False
    def only_pop(self):# {{{
        """
        <b>Funkcja only_pop</b> usuwa pierwszy element z kolejki. Gdy usuwa agenta,
        zapisuje, iż opuścił on kolejkę oraz zwraca True, w przeciwnym wypadku zwraca False
        """
        data = self.queue.pop(0)
        if data is not None:
            self.counter.get(data, {})["finished"] = 1
            return data
        else:
            return False# }}}
    def only_pop_none(self):
        for i in range(len(self.queue)):
            if self.queue[i] == None:
                del self.queue[i]
                return True
        return False
    def can_move_in_next_step(self, position):
        if None in self.queue[:position] or position == 0:
            return True
        return False
    def count(self):# {{{
        """
        <b>Funkcja count</b> zlicza poszczególnym agentom jak długo znajdują się w kolejce,
        a także zapisuje na którym miejscu się znajdują w danej chwili.
        """
        for x, i in enumerate(self.queue):
            if i is not None:
                self.counter.get(i, {})['steps'] += 1
                self.counter.get(i, {})['cur_pos'] = x# }}}
    def print_count(self):# {{{
        """<b>Funckja print_count</b> służy do wyświetlania na ekranie licznika."""
        if self.counter.keys():
            print(self.name)
            for i in self.counter.keys():
                print(self.counter[i])#}}}
    def count_completed(self):# {{{
        """<b>Funkcja count_completed</b> zwraca liczbę agentów, którzy już opuścili kolejkę."""
        return sum([self.counter[x]["finished"] for x in self.counter.keys()])# }}}
    def count_insiders(self):# {{{
        """<b>Funkcja count_insiders</b> zwraca liczbę agentów, którzy przebywają w kolejce."""
        return len([x for x in self.queue if x is not None])# }}}
    def give_index(self, agent_id):# {{{
        """
        <b>Funkcja give_index</b> pobiera parametr:<br>
        agent_id - identyfikator danego agenta,<br>
        Zwraca pozycję na której znajduje się agent.
        """
        return self.queue.index(agent_id)# }}}
    def check_if_in_que(self, agent_id):# {{{
        """
        <b>Funkcja check_if_in_que</b> pobiera parametr:<br>
        agent_id - identyfikator danego agenta,<br>
        Sprawdza, czy agent znajduje się w kolejce, jeżeli tak zwraca True, w przeciwnym wypadku zwraca False.
        """
        if agent_id in self.queue:
            return True
        else:
            return False# }}}


class Staircase:
    """
    <b>Klasa Staircase</b> reprezentuje klatkę schodową. Tutaj tworzone są obiekty klasy <b>Queue</b> (funkcja create_queues) 
    w zależności jak pojemna jest klatka schodowa. Obliczane są położenia poszczególnych miejsc kolejki (funkcja create_floor_positions, 
    create_positions). Dodawani są agenci (funkcja add_to_queues). Sprawdzane jest czy dany agent znajduje się w klatce 
    schodowej (funkcja check_if_in). Zliczana jest liczba agentów przebywających na klatce, jak również tych którzy ukończyli 
    schodzenie (funkcja total_number_of_people, total_completed). Następuje przesunięcie kolejek (funkcja move). 
    Istnieje opcja wyświetlenia stanu poszczególnych kolejek (funkcja show_status), obliczenia gęstości zapełnienia klatki
    (funkcja density2) oraz przepływu agentów przez wyjście (funkcja flow).
    """
    def __init__(self, name: str="Str1", floors: int=3, number_queues: int=2, exits: int=1, width: float=500, height: float=2965/3, offsetx: int=1500, offsety: int=0, ty: dict={'0': 3000, '1':500}):# {{{
        """
        Podczas tworzenia obiektu klasy Staircase nadawana jest mu nazwa (name), przypisywana liczba pięter (floors),
        liczba kolejek klasy Queue (number_queues), liczba wyjść (exits), a także wprowadzane są wymiary klatki (width, height)
        oraz jej przesunięcie na potrzeby animacji (offsetx, offsety). Tworzony jest wskaźnik zliczający ilość agentów, którzy się poruszyli
        w danym momencie (insert). Obliczana jest długość przeciwprostokątnej rzutu klatki schodowej (lenght) w celu wyznaczenia pojemności
        (floor_space) kolejek, które są generowane. Obliczane i zapisywane są pozycje dla poszególnych miejsc kolejki.
        """
        self.name = name
        self.floors = floors
        self.number_queues = number_queues
        self.exits = exits
        self.width = width
        self.height = height
        self.offsetx = offsetx
        self.offsety = offsety
        self.ty = ty
        self.insert = 0
        self.lenght = (self.width**2+self.height**2)**(1/2)
        #self.floor_space = int((self.width+self.lenght)/50)
        self.floor_space = 10
        self.entrance = {i:self.number_queues for i in range(self.floors+1)} # 1 ground floor
        self.ques = self.create_queues()
        self.positions = self.create_positions() # }}}

    def create_queues(self):# {{{
        """<b>Funkcja create_queues</b> tworzy kilka kolejek (obiekty klasy Queue)."""
        que = []
        for i in range(self.number_queues):
            que.append(Queue(f'Que-{i}', self.floors, self.floor_space))
        return que# }}}
    # def create_floor_positions(self,floor=0):# {{{
    #     """<b>Funkcja create_floor_positions</b> pobiera parametr:<br>
    #     floor -piętro dla którego ma wygenerować położenia,<br>
    #     Zwraca listę składającą się z koordynat (x,y) odpowiadającą miejscami danego piętra.
    #     """
    #     positions = []
    #     sin_alfa = self.height/self.lenght
    #     cos_alfa = self.width/self.lenght
    #     lenght_steps = (self.width+self.lenght)/self.floor_space
    #     for i in range(self.floor_space):
    #         l = i*lenght_steps
    #         if l>self.lenght:
    #             x = self.offsetx+lenght_steps*(self.floor_space-i)
    #             #y = self.offsety+floor*self.height+self.height+self.ty[str(floor)]
    #             y = self.offsety+self.height+self.ty[str(floor)]
    #         else:
    #             x = self.offsetx+l*cos_alfa
    #             y = self.offsety+self.height+l*sin_alfa+self.ty[str(floor)]
    #         positions.append((int(x),int(y)))
    #     return positions# }}}
    def create_floor_positions(self,floor=0, queue=0):
        positions = []
        w = self.width/self.number_queues
        no_y = int(self.height/25)-1
        no_x = int(w/25)
        no_pos = 0
        for nx in range(no_x):
            for ny in range(no_y):
                if nx % 2 == 0:
                    x = self.offsetx+(1+nx)*25+queue*w
                    y = self.ty[str(floor)]-(1+ny)*25
                else:
                    x = self.offsetx+(1+nx)*25+queue*w
                    y = self.ty[str(floor)]-self.height+(1+ny)*25
                positions.append((int(x),int(y)))
                no_pos += 1
                if no_pos == self.floor_space:
                    return positions
        raise Exception("Floor_space > available space to animate positions")

    def create_positions(self):# {{{
        """<b>Funkcja create_positions</b> generuje i zwraca listę z koordynatami (x,y) dla wszystkich miejsc kolejki."""
        d_pos = {}
        for j in range(self.number_queues):
            positions = []
            for i in range(self.floors):
                positions.extend(self.create_floor_positions(floor=i, queue=j))
            d_pos[j] = positions
        return d_pos# }}}
    
    def get_data_for_visualization(self):
        for i in range(self.number_queues):
            for x, agent in enumerate(self.ques[i]):
                if agent is not None:
                    agent.position = self.positions[i][x]
            
    
    def add_to_queues(self, floor, agent_id):# {{{
        """
        <b>Funkcja add_to_queues</b> pobiera dwa parametry:<br>
        floor -piętro, na którym ma być dodany agent,<br>
        agent_id -identyfikator danego agenta.<br>
        Funkcja próbuje dodać agenta do jednej z kolejek, gdy agent zostanie dodany zwraca True, w innym przypadku False.
        """
        if floor == 0:
            position = 0
        else:
            position = floor*self.floor_space-1
        for i in self.sort_ques(position):
            output = i.add(position, agent_id)
            if output == 1:
                self.entrance[floor] -= 1
                return True
            elif output == 2:
                if self.is_accessible_exit():
                    self.insert += 1
                    self.entrance[floor] -= 1
                    i.insert(position, agent_id)
                    return True
        return False # }}}

    def sort_ques(self, position):
        temp = []
        for q in self.ques:
            try:
                temp.append((q, q[position], q[position+1], q.moved))
            except IndexError:
                temp.append((q, q[position], q[position], q.moved))
        temp.sort(key=lambda x: ((x[1] is not None, x[2] is not None, x[3]) if (x[1] is None)
                                else (x[1] is not None, x[3], x[2] is not None)))
        return [i[0] for i in temp]
        # [q, None, None, F], [q, None, None, T], [q, None, "agent", F], [q, None, "agent", T]
        #    [q, "agent", None, F], [q, "agent", "agent", F], [q, "agent", None, T], [q, "agent", "agent", T]

    def is_accessible_exit(self):
        if self.insert < self.exits:
            return True
        return False
    def is_accessible_entrance(self, floor):
        if self.entrance[floor] > 0:
            return True
        if self.entrance[floor] <= 0:
            if sum(abs(i) for i in self.entrance.values() if i < 0) < self.exits:
                return True
        return False
    def check_if_in(self, agent_id):# {{{
        """
        <b>Funkcja check_if_in</b> pobiera parametr:<br>
        agent_id -identyfikator danego agenta,<br>
        Sprawdza czy dany agent znajduje się w którejś z kolejek, jeśli tak zwraca jego położenie.
        """
        for i in range(len(self.ques)):
            if self.ques[i].check_if_in_que(agent_id):
                x,y = self.positions[self.ques[i].give_index(agent_id)]
                x += i*100
                y += i*100
                return int(x), int(y)# }}}
            else:
                return False


    def total_number_of_people(self):# {{{
        """<b>Funkcja total_number_of_people</b> zwraca liczbę wszystkich agentów, którzy przebywają w kolejkach."""
        Ptotal=0
        for i in self.ques:
            Ptotal+=i.count_insiders()
        return Ptotal# }}}

    def total_completed(self):# {{{
        """<b>Funkcja total_completed</b> zwraca liczbę wszystkich agentów, którzy ukończyli kolejkę."""
        number = 0
        for i in self.ques:
            number+=i.count_completed()
        return number# }}}

    def move(self):# {{{
        """
        <b>Funkcja move</b> jest krokiem czasowym dla kolejek. Odpowiednio przesuwa lub wstrzymuje kolejki, w zależności
        od zapełnienia danej kolejki i dostępnych wyjść.
        """
        for i in self.entrance:
            self.entrance[i] = min(self.entrance[i]+self.number_queues, self.number_queues)
        self.insert = 0
        agent_dropped = 0
        for que in sorted(self.ques, key=lambda x: x.moved, reverse=True):
            que.count()
            if agent_dropped < self.exits:
                if que.moved:
                    que.moved = False
                    if que.only_pop():
                        agent_dropped += 1
                else:
                    if que.pop():
                        agent_dropped += 1
            else:
                if que.moved:
                    if que.only_pop_none():
                        que.moved = False
                else:
                    que.pop_none()

    def show_status(self):# {{{
        """<b>Funkcja show_status</b> wyświetla na ekranie stan poszczególnych kolejek."""
        for i in self.ques:
            i.print_count()# }}}
    def save_ques(self):
        with open('/home/mateusz/que.txt', 'a') as f:
            for i in range(len(self.ques[0])):
                print(i,";",self.ques[0][i],";",self.ques[1][i], file=f)
    def density2(self, x):# {{{
        """<b>Funkcja density2</b> zwraca procentowy poziom zapełnienia klatki schodowej."""
        return ceil(x/((len(self.ques[0])-2)*self.number_queues)*100)# }}}
    def flow(self):# {{{
        """<b>Funkcja flow</b> zwraca wartość średniego przepływu agentów przez klatkę schodową."""
        self.Dexit = (self.lenght+self.width)/100*floors
# Dexit -maksymalny dystans przebyty przez agenta w klatce schodowej
        Fave = 0.42*(self.total_completed()/self.Dexit)**(1/3)
        return Fave# }}}
