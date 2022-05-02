from datetime import datetime
import mysql.connector
import time


class DBConnector:
    host = None
    user = None
    password = None
    database = None
    connection = None
    cursor = None

    def __init__(self, host, user, password, database):
        self.host = host
        self.user = user
        self.password = password
        self.database = database

    def connect_to_database(self):
        self.connection = mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database
        )
        print(self.connection)

        self.cursor = self.connection.cursor()
        self.cursor.execute("SHOW DATABASES")
        for x in self.cursor:
            print(x)

    def list_tables(self):
        self.cursor.execute("SHOW TABLES")
        for x in self.cursor:
            print(x)

    def fetch_from_table(self, table, qualifier):
        self.cursor.execute("SELECT " + qualifier + " FROM " + table)
        results = self.cursor.fetchall()
        for x in results:
            if len(x.__str__()) > 100:
                print(x.__str__()[0:100])
            else:
                print(x.__str__())
        return results

    def insert_new_footage(self, image_binary):
        statement = "INSERT INTO footage (account_ID, time_stamp, footage) VALUES (%s, %s, %s)"
        values = (1, time.strftime('%Y-%m-%d %H:%M:%S'), image_binary)
        self.cursor.execute(statement, values)
        self.connection.commit()
        print('Saving capture: ' + datetime.now().__str__())
