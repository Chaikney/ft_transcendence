NAME = chess
CC = c++
CFLAGS = -Wall -Werror -Wextra
RM = rm -f

INCLUDE_DIR	= include
INCLUDES	= -I$(INCLUDE_DIR)

SRC =Board.cpp BoardParsing.cpp getSet.cpp main.cpp Piece.cpp SANParser.cpp

OBJ_DIR = obj

OBJS = $(SRC:.cpp=.o)
OBJECTS	= $(addprefix $(OBJ_DIR)/, $(OBJS))

obj/%.o: src/%.cpp
	@mkdir -p obj
	$(CC) $(CFLAGS) -c $< $(INCLUDES) -o $@

$(NAME): $(OBJECTS)
	@echo $(OBJECTS)
	$(CC) $(CFLAGS) $(OBJECTS) $(MLXFLAGS) -o $@ 


all: $(NAME) 


clean:
	$(RM) $(OBJECTS)

fclean: clean
	rm -rf obj
	$(RM) $(NAME)

re: fclean all
