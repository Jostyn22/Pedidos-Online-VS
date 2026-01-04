from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Pedido, PedidoDetalle
from Productos.models import Producto
from .serializers import PedidoSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework.views import APIView


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_pedido(request):
    try:
        carrito = request.data.get("carrito", [])

        if not carrito:
            return Response({"error": "Carrito vacío"}, status=400)

        cliente = request.user

        primer_producto = Producto.objects.filter(
            id=carrito[0].get("producto_id")
        ).first()

        if not primer_producto:
            return Response({"error": "Producto no válido"}, status=400)

        pedido = Pedido.objects.create(
            cliente=cliente,
            vendedor=primer_producto.vendedor,
            total=0
        )

        total = 0

        for item in carrito:
            producto = Producto.objects.filter(
                id=item.get("producto_id")
            ).first()

            if not producto:
                return Response({"error": "Producto no encontrado"}, status=400)

            cantidad = int(item.get("cantidad", 0))

            if cantidad <= 0:
                return Response({"error": "Cantidad inválida"}, status=400)

            # 🔴 VALIDACIÓN CRÍTICA DE STOCK
            if producto.stock < cantidad:
                return Response(
                    {"error": f"Stock insuficiente para {producto.nombre}"},
                    status=400
                )

            PedidoDetalle.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio=producto.precio
            )

            total += producto.precio * cantidad
            producto.stock -= cantidad
            producto.save()

        pedido.total = total
        pedido.save()

        return Response({
            "mensaje": "Pedido creado correctamente",
            "pedido_id": pedido.id
        })

    except Exception as e:
        print("ERROR CREANDO PEDIDO:", e)
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pedidos_cliente(request):
    pedidos = Pedido.objects.filter(cliente=request.user).order_by('-fecha')
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cambiar_estado_pedido(request, pedido_id):
    try:
        pedido = Pedido.objects.get(id=pedido_id)
        if pedido.vendedor != request.user:
            return Response({"error": "No tienes permisos para actualizar este pedido"}, status=403)
        ESTADOS = ["PENDIENTE", "PREPARANDO", "LISTO", "ENTREGADO"]
        try:
            indice_actual = ESTADOS.index(pedido.estado)
            pedido.estado = ESTADOS[indice_actual + 1] if indice_actual + 1 < len(ESTADOS) else pedido.estado
        except ValueError:
            return Response({"error": "Estado no válido"}, status=400)

        pedido.save()
        return Response({"mensaje": "Estado actualizado", "nuevo_estado": pedido.estado})

    except Pedido.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=404)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pedidos_vendedor(request):
    try:
        if request.user.rol != "VENDEDOR":
            return Response({"error": "Este usuario no es vendedor"}, status=403)
        pedidos = Pedido.objects.filter(vendedor=request.user).order_by('-fecha')
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        print("ERROR EN pedidos_vendedor:", e)
        return Response({"error": str(e)}, status=500)
class PedidoAdminViewSet(ModelViewSet):
    queryset = Pedido.objects.all().order_by('-fecha')
    serializer_class = PedidoSerializer
    permission_classes = [IsAdminUser]
@api_view(["GET"])
@permission_classes([IsAdminUser])
def imprimir_pedido(request, pedido_id):
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet

    try:
        pedido = Pedido.objects.get(id=pedido_id)
        detalles = pedido.detalles.all()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Factura_{pedido.id}.pdf"'

        pdf = SimpleDocTemplate(response, pagesize=letter, leftMargin=35, rightMargin=35, topMargin=30)
        estilos = getSampleStyleSheet()
        contenido = []
        # ENCABEZADO
        encabezado = Paragraph("""
        <b><font size=14>VIVIR SANO</font></b><br/>
        RUC:  1309360210001<br/>
        Dirección Matriz:  Calle: AV. DEL EJERCITO Numero: D29 Interseccion:
 AV. 5 DE JUNIO Y VENEZUELA<br/>
        Dirección Sucursal:  Calle: AV. DEL EJERCITO Numero: D29 Interseccion:
 AV. 5 DE JUNIO Y VENEZUELA<br/>
        Teléfono: 098 531 2186  |  Email: vivirsano@gmail.com<br/>
        <br/>
        <b>FACTURA</b> &nbsp;&nbsp; 001-001-000001<br/>
        <b>NÚMERO DE AUTORIZACIÓN:</b> 123456789012345678901234567890123456789012345678<br/>
        <font size=9><b>CLAVE DE ACCESO:</b> 08032025123456789012345678901234567890123456789012345678</font>
        """, estilos["Normal"])
        contenido.append(encabezado)
        contenido.append(Spacer(1, 14))

        # DATOS DEL CLIENTE
        cliente_info = Paragraph(f"""
        <font size=10>
        <b>Cliente:</b> {pedido.cliente.username}<br/>
        <b>Identificación:</b> 0000000000<br/>
        <b>Fecha de Emisión:</b> {pedido.fecha.strftime('%Y-%m-%d %H:%M')}<br/>
        <b>Vendedor:</b> {pedido.vendedor.username if pedido.vendedor else "No asignado"}<br/>
        </font>
        """, estilos["Normal"])
        contenido.append(cliente_info)
        contenido.append(Spacer(1, 14))

        # TABLA DE PRODUCTOS
        tabla_datos = [["Cod. Principal", "Descripción", "Cantidad", "P. Unit", "Precio Total"]]

        for d in detalles:
            tabla_datos.append([
                str(d.producto.id),
                d.producto.nombre,
                str(d.cantidad),
                f"${float(d.precio):.2f}",
                f"${float(d.subtotal()):.2f}"
            ])

        tabla = Table(tabla_datos, colWidths=[90, 200, 60, 80, 80])
        tabla.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#dcdcdc")),
            ('GRID', (0,0), (-1,-1), 0.7, colors.black),
            ('ALIGN', (2,1), (-1,-1), 'CENTER')
        ]))
        contenido.append(tabla)
        contenido.append(Spacer(1, 14))

        #TOTALES CON IVA 15%
        total = float(pedido.total)
        subtotal = total / 1.15
        iva = total - subtotal

        totales_tabla = Table([
            ["SUBTOTAL 0%:", f"${subtotal:.2f}"],
            ["IVA 15%:", f"${iva:.2f}"],
            ["TOTAL:", f"${total:.2f}"]
        ], colWidths=[350, 150])
        totales_tabla.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ]))
        contenido.append(totales_tabla)

        #FORMA DE PAGO
        contenido.append(Spacer(1, 12))
        contenido.append(Paragraph("<b>Forma de Pago:</b> 01 - Tarjeta", estilos["Normal"]))

        pdf.build(contenido)
        return response

    except Pedido.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=404)
class EliminarPedidoView(APIView):
    permission_classes = [permissions.IsAdminUser]  

    def delete(self, request, pedido_id):
        try:
            pedido = Pedido.objects.get(id=pedido_id)
            pedido.delete()
            return Response({"message": "Pedido eliminado correctamente"}, status=200)
        except Pedido.DoesNotExist:
            return Response({"error": "Pedido no encontrado"}, status=404)
