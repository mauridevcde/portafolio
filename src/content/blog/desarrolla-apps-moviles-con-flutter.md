---
title: "Desarrolla Apps Móviles con Flutter y Dart: Tutorial Completo"
description: "Aprende a crear aplicaciones móviles con Flutter y Dart, la combinación perfecta para desarrollar apps móviles en Latinoamérica, sigue nuestro flutter tutorial."
keywords: "Flutter, Dart, app móvil, flutter tutorial, flutter dart, app movil flutter latam, flutter state management, flutter widgets"
tag: "Flutter · Dart"
tagSlug: "flutter"
publishedDate: 2026-04-23
ogImage: "/assets/mauriciogonzalezpicture.png"
draft: false
---

Flutter es, en mi experiencia, el framework más productivo para desarrollar aplicaciones móviles cuando querés llegar a Android e iOS con un solo codebase y sin sacrificar la calidad de la UI. En proyectos como [EducConnect](/#projects) usé Flutter para el módulo móvil y la experiencia fue excelente: rendimiento nativo, hot reload para iteración rápida y widgets altamente personalizables.

En este tutorial vamos desde la instalación hasta una app completa con navegación, estado y consumo de API.

## ¿Por qué Flutter en 2025?

Flutter compite principalmente con React Native. Mis razones para preferirlo en la mayoría de proyectos:

| Criterio | Flutter | React Native |
|----------|---------|-------------|
| Rendimiento | Excelente (Skia/Impeller) | Bueno (mejorando) |
| Hot Reload | Muy rápido | Rápido |
| UI personalizada | Total control | Limitado por componentes nativos |
| Curva de aprendizaje | Media (Dart) | Baja (JS/TS que ya conocés) |
| Ecosistema pub.dev | Grande y creciendo | Muy grande (npm) |
| Web/Desktop | Sí (experimental→estable) | Web sí, Desktop limitado |

Si ya sabés JavaScript, React Native puede ser más rápido para arrancar. Si priorizás calidad de UI y rendimiento consistente entre plataformas, Flutter es la mejor opción.

## Instalación del entorno

### En macOS

```bash
# Descargar Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable ~/flutter

# Agregar al PATH en ~/.zshrc
export PATH="$HOME/flutter/bin:$PATH"
source ~/.zshrc

# Verificar instalación y diagnóstico
flutter doctor
```

`flutter doctor` te dice exactamente qué falta instalar (Android Studio, Xcode, simuladores, etc.).

### En Windows

1. Descargar el ZIP del SDK desde flutter.dev
2. Extraer en `C:\flutter`
3. Agregar `C:\flutter\bin` al PATH del sistema

### Configurar Android Studio

```bash
# Aceptar licencias de Android SDK
flutter doctor --android-licenses

# Verificar que todo esté OK
flutter doctor -v
```

## Crear y entender la estructura del proyecto

```bash
flutter create mi_app
cd mi_app
flutter run
```

```
mi_app/
├── lib/
│   └── main.dart          ← Punto de entrada
├── android/               ← Config nativa Android
├── ios/                   ← Config nativa iOS
├── pubspec.yaml           ← Dependencias (como package.json)
└── test/                  ← Tests unitarios y de widget
```

## Widgets: el concepto fundamental

En Flutter, **todo es un widget**. La UI se construye como un árbol de widgets anidados.

```dart
// lib/main.dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mi App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: Colors.blue,
        useMaterial3: true,
      ),
      home: const PantallaInicio(),
    );
  }
}
```

### StatelessWidget vs StatefulWidget

```dart
// StatelessWidget: UI que no cambia
class TarjetaUsuario extends StatelessWidget {
  final String nombre;
  final String email;

  const TarjetaUsuario({
    super.key,
    required this.nombre,
    required this.email,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(child: Text(nombre[0])),
        title: Text(nombre),
        subtitle: Text(email),
      ),
    );
  }
}

// StatefulWidget: UI con estado mutable
class Contador extends StatefulWidget {
  const Contador({super.key});

  @override
  State<Contador> createState() => _ContadorState();
}

class _ContadorState extends State<Contador> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$_count', style: Theme.of(context).textTheme.headlineLarge),
        ElevatedButton(
          onPressed: () => setState(() => _count++),
          child: const Text('Incrementar'),
        ),
      ],
    );
  }
}
```

## Layout: los widgets más usados

```dart
// Columna vertical
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Título', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
    const SizedBox(height: 8),
    Text('Descripción del contenido'),
  ],
)

// Fila horizontal con espaciado
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    IconButton(icon: Icon(Icons.home), onPressed: () {}),
    Text('Centro'),
    IconButton(icon: Icon(Icons.settings), onPressed: () {}),
  ],
)

// Lista infinita de elementos
ListView.builder(
  itemCount: usuarios.length,
  itemBuilder: (context, index) {
    final usuario = usuarios[index];
    return TarjetaUsuario(
      nombre: usuario.nombre,
      email: usuario.email,
    );
  },
)
```

## Navegación entre pantallas

```dart
// Definir rutas en MaterialApp
MaterialApp(
  routes: {
    '/': (context) => const PantallaInicio(),
    '/perfil': (context) => const PantallaPerfil(),
    '/detalle': (context) => const PantallaDetalle(),
  },
)

// Navegar con Navigator
// Push: agregar pantalla al stack
Navigator.pushNamed(context, '/perfil');

// Push con argumentos
Navigator.pushNamed(context, '/detalle', arguments: {'id': usuario.id});

// Pop: volver a la pantalla anterior
Navigator.pop(context);

// Reemplazar la pantalla actual
Navigator.pushReplacementNamed(context, '/inicio');
```

### Recibir argumentos en la pantalla destino

```dart
class PantallaDetalle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final id = args['id'] as String;

    return Scaffold(
      appBar: AppBar(title: Text('Detalle $id')),
      body: Center(child: Text('ID: $id')),
    );
  }
}
```

## Consumir una API REST con http

```bash
# pubspec.yaml
dependencies:
  http: ^1.2.0
  json_annotation: ^4.9.0
```

```dart
// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String _baseUrl = 'https://mi-api.com/api';

  Future<List<Usuario>> getUsuarios() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/usuarios'),
      headers: {
        'Authorization': 'Bearer ${await _getToken()}',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> json = jsonDecode(response.body);
      return json.map((e) => Usuario.fromJson(e)).toList();
    } else {
      throw Exception('Error al obtener usuarios: ${response.statusCode}');
    }
  }

  Future<void> crearUsuario(CreateUsuarioDto dto) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/usuarios'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(dto.toJson()),
    );

    if (response.statusCode != 201) {
      throw Exception('Error al crear usuario');
    }
  }
}
```

## Manejo de estado con Provider

Para state management simple a moderado, uso **Provider** (recomendado por el equipo de Flutter):

```bash
dependencies:
  provider: ^6.1.0
```

```dart
// lib/providers/usuarios_provider.dart
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/usuario.dart';

class UsuariosProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  List<Usuario> _usuarios = [];
  bool _cargando = false;
  String? _error;

  List<Usuario> get usuarios => _usuarios;
  bool get cargando => _cargando;
  String? get error => _error;

  Future<void> cargar() async {
    _cargando = true;
    _error = null;
    notifyListeners();

    try {
      _usuarios = await _api.getUsuarios();
    } catch (e) {
      _error = e.toString();
    } finally {
      _cargando = false;
      notifyListeners();
    }
  }
}
```

```dart
// Usar el Provider en la UI
Consumer<UsuariosProvider>(
  builder: (context, provider, child) {
    if (provider.cargando) return const CircularProgressIndicator();
    if (provider.error != null) return Text('Error: ${provider.error}');

    return ListView.builder(
      itemCount: provider.usuarios.length,
      itemBuilder: (_, i) => TarjetaUsuario(
        nombre: provider.usuarios[i].nombre,
        email: provider.usuarios[i].email,
      ),
    );
  },
)
```

## Build para producción

```bash
# Android APK (para distribución directa)
flutter build apk --release

# Android App Bundle (para Google Play Store)
flutter build appbundle --release

# iOS (requiere macOS y Xcode)
flutter build ios --release

# Verificar tamaño de la app
flutter build apk --analyze-size
```

### Firmar la APK para Android

```bash
# Generar keystore
keytool -genkey -v -keystore mi_app.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mi_app

# Configurar en android/key.properties
storeFile=../mi_app.jks
storePassword=mi_password
keyAlias=mi_app
keyPassword=mi_password
```

## Testing en Flutter

```dart
// test/widget_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mi_app/main.dart';

void main() {
  testWidgets('La app arranca sin errores', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('Bienvenido'), findsOneWidget);
  });

  test('Modelo Usuario serializa correctamente', () {
    final usuario = Usuario.fromJson({
      'id': '1',
      'nombre': 'Juan',
      'email': 'juan@test.com',
    });
    expect(usuario.nombre, equals('Juan'));
  });
}
```

## Conclusión

Flutter es una apuesta sólida para proyectos móviles que necesiten llegar a Android e iOS con una sola codebase. Dart tiene una curva de aprendizaje breve si ya sabés programar orientado a objetos, y la documentación oficial es excelente.

Mi recomendación para arrancar: instalá el entorno, corré `flutter create mi_app` y experimentá con los widgets básicos. En pocas horas vas a tener una app funcional en tu simulador.

¿Querés ver Flutter aplicado en un proyecto real? Revisá el módulo móvil de [EducConnect](/#projects) o escribime desde [contacto](/#contact).
