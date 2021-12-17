def func_name_decor(func):
	def wrapper():
		print("--start-- ",func.__name__)
		func()
		print("--koniec--")

	return wrapper
