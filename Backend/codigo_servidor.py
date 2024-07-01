import pandas as pd
import paho.mqtt.client as mqtt
import json

# Configurações do broker
broker = "localhost"
port = 9001
subscribe_topic = 'topico/teste'
response_topic = 'topico/resposta'

# Leitura do arquivo Parquet apenas uma vez
caminho_do_arquivo_parquet = './df_data_type.parquet'
df = pd.read_parquet(caminho_do_arquivo_parquet)

# Função callback quando a conexão for estabelecida
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Conectado ao broker")
        client.subscribe(subscribe_topic)
    else:
        print("Falha na conexão, código de retorno:", rc)

# Função callback quando uma mensagem for recebida
def on_message(client, userdata, msg):
    print(f"Mensagem recebida: {msg.payload.decode()} no tópico {msg.topic}")
    
    # Carrega a mensagem
    data = json.loads(msg.payload)
    informacao = data.get("informacao")
    
    # Filtra as linhas de acordo com a mensagem recebida
    df_filtered = df[df['device.device_report_product_code'] == informacao]
    
    # Seleciona apenas as colunas específicas
    colunas_especificas = ["event_type", "report_number", "patient", "device.device_operator", "new_device.device_product_code_name", "new_device.brand_generic_name"]
    df_selecionado = df_filtered[colunas_especificas]
    
    # Limita os dados aos primeiros 10 resultados
    df_selecionado_10 = df_selecionado.head(10)
    
    # Converte o DataFrame para uma lista de dicionários para envio via MQTT
    dados_json = df_selecionado_10.to_json(orient='records')
    
    # Publica os dados no tópico MQTT de resposta
    client.publish(response_topic, dados_json)
    print(f"Publicado: {dados_json} no tópico {response_topic}")

# Inicializa o cliente MQTT com a URL WebSocket
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id="", transport="websockets")

# Define as funções callback de conexão e mensagem
client.on_connect = on_connect
client.on_message = on_message

# Conecta ao broker via WebSocket
client.connect(broker, port, 60)

# Inicia o loop de processamento em segundo plano
client.loop_forever()
