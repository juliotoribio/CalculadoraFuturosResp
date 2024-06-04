from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calcular', methods=['POST'])
def calcular():
    data = request.json
    tipo_operacion = data['tipo_operacion']
    numero_entradas = data['numero_entradas']
    precio_entrada = data['precio_entrada']
    rango_entrada = data['rango_entrada'] / 100
    inversion_total = data['inversion_total']
    porcentajes_distribucion = data['porcentajes_distribucion']

    precios_entrada = []
    inversiones_por_entrada = []

    rango_entradas = rango_entrada / (numero_entradas - 1) if numero_entradas > 1 else 0

    if tipo_operacion == 'long':
        for i in range(numero_entradas):
            precio_entrada_i = precio_entrada * (1 - rango_entradas * i)
            precios_entrada.append(precio_entrada_i)
            inversiones_por_entrada.append((porcentajes_distribucion[i] / 100) * inversion_total)
    elif tipo_operacion == 'short':
        for i in range(numero_entradas):
            precio_entrada_i = precio_entrada * (1 + rango_entradas * i)
            precios_entrada.append(precio_entrada_i)
            inversiones_por_entrada.append((porcentajes_distribucion[i] / 100) * inversion_total)

    response = {
        "precios_entrada": precios_entrada,
        "inversiones_por_entrada": inversiones_por_entrada
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
