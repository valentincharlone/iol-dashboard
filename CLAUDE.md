# IOL Dashboard — Notas de desarrollo

Dashboard personal de inversiones consumiendo la API de InvertirOnline (IOL) v2.
Stack: Next.js 15 App Router, TypeScript, Tailwind, inline styles.

---

## Estado de los datos: real vs mock

### ✅ Datos reales (vienen de la API de IOL)

| Dato | Endpoint |
|---|---|
| Valuación total del portafolio | `GET /api/v2/portafolio/argentina` |
| Posiciones (ticker, cantidad, precio, valuación, variación diaria) | `GET /api/v2/portafolio/argentina` |
| Rendimiento total (% y pesos) | `GET /api/v2/estadocuenta` |
| Variación hoy (promedio ponderado por valuación) | Calculado desde `portafolio` |
| Efectivo disponible ARS y USD | `GET /api/v2/estadocuenta` |
| Holdings table completa | `GET /api/v2/portafolio/argentina` |
| Distribución donut (CEDEARs / Acciones / Bonos / FCI) | Calculado desde `portafolio` |

### ❌ Gráfico de evolución del portafolio (descartado por ahora)

`src/components/EvolutionChart.tsx` y `src/app/api/portfolio-history/route.ts` existen pero el chart está comentado en `dashboard/page.tsx`.

**Problema**: `seriehistorica` devuelve precios históricos por ticker, pero usamos cantidades de HOY para todo el período. Esto genera artefactos cuando:
- Hubo cambios de ratio en CEDEARs (sinAjustar no los corrige)
- Posiciones abiertas/cerradas durante el período
- Bonos con convenciones de precio incompatibles con `cantidad × precio`

Para hacerlo bien se necesita el historial de composición del portafolio por fecha (qué cantidad de cada ticker tenías en cada día), que la API de IOL no provee.

#### Market strip (Merval, S&P 500, MEP, Blue)

Actualmente hardcodeado con valores inventados en `src/app/dashboard/page.tsx`.

**Cómo conectarlo:**
- S&P 500 (vía SPY CEDEAR): `GET /api/v2/bCBA/Titulos/SPY/Cotizacion`
- Dólar MEP: `POST /api/v2/Cotizaciones/MEP` o `GET /api/v2/Cotizaciones/MEP/{simbolo}`
- S&P Merval: probar si `MERVAL` es símbolo válido en `GET /api/v2/bCBA/Titulos/MERVAL/Cotizacion`
- Dólar Blue: **no disponible en la API de IOL** (es mercado informal), habría que usar otra fuente

---

## Referencia API IOL v2

Documentación completa disponible en:
- `e:\Usuario\Downloads\InvertirOnLine_API_v2_Documentacion.html` — navegable en browser
- `e:\Usuario\Downloads\InvertirOnLine_swagger_v2.json` — importable en Postman/Insomnia

Host: `https://api.invertironline.com`

### Endpoints relevantes para el dashboard

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/v2/estadocuenta` | GET | Saldo, disponible ARS/USD, ganancia total |
| `/api/v2/portafolio/{pais}` | GET | Posiciones con precio, cantidad, valuación |
| `/api/v2/operaciones` | GET | Historial de operaciones (fechaDesde, fechaHasta, estado, etc.) |
| `/api/v2/operaciones/{numero}` | GET | Detalle de una operación |
| `/api/v2/{Mercado}/Titulos/{Simbolo}/Cotizacion` | GET | Cotización actual de un ticker |
| `/api/v2/{mercado}/Titulos/{simbolo}/CotizacionDetalle` | GET | Cotización con más detalle (puntas, variación) |
| `/api/v2/{mercado}/Titulos/{simbolo}/Cotizacion/seriehistorica/{fechaDesde}/{fechaHasta}/{ajustada}` | GET | Serie histórica de un ticker — devuelve `CotizacionModel[]` |
| `/api/v2/Cotizaciones/MEP/{simbolo}` | GET | Cotización dólar MEP para un símbolo |
| `/api/v2/Cotizaciones/MEP` | POST | Cotización MEP simplificada |
| `/api/v2/Cotizaciones/{Instrumento}/{Pais}/Todos` | GET | Todas las cotizaciones de un instrumento (acciones, cedears, etc.) |
| `/api/v2/Cotizaciones/{Instrumento}/{Panel}/{Pais}` | GET | Cotizaciones por panel |

### Mercados válidos (`{mercado}`)
`bCBA` · `nYSE` · `nASDAQ` · `aMEX` · `bCS` · `rOFX`

### Tipos de instrumento
`opciones` · `cedears` · `acciones` · `aDRs` · `titulosPublicos` · `cauciones` · `futuros` · `obligacionesNegociables` · `letras`

### CotizacionModel (respuesta de seriehistorica y cotización actual)
```
ultimoPrecio    number   Precio de cierre del día
fechaHora       string   Fecha ISO 8601
apertura        number
maximo          number
minimo          number
cierreAnterior  number
variacion       number   % de variación
montoOperado    number
volumenNominal  number
moneda          enum     peso_Argentino | dolar_Estadounidense | ...
```

### Nota sobre seriehistorica
- No existe endpoint batch — una llamada por ticker
- Con 27 posiciones → 27 llamadas paralelas (`Promise.all`)
- `ajustada` es importante para CEDEARs (incorpora splits y dividendos)
- Los históricos no cambian durante el día → cachear por período

---

## Autenticación IOL

- Bearer token (expira ~15 min) + refresh token
- Persistido en `.iol-token.json` (ignorado por git) para sobrevivir reinicios del servidor
- Lógica en `src/lib/iol-auth.ts`: memoria → disco → refresh → login fresco
- Credenciales en `.env.local`: `IOL_USERNAME` y `IOL_PASSWORD`

---

## Pendientes futuros

- [x] Conectar gráfico de evolución con `seriehistorica`
- [ ] Conectar market strip con cotizaciones reales
- [ ] Deploy en Vercel + login con NextAuth (usuario único)
- [ ] Página de Cotizaciones (sidebar muestra "PRONTO")
- [ ] Página de Movimientos / Operaciones (sidebar muestra "PRONTO")
- [x] Actualizar `next` a `>=15.3.4` (CVE-2025-66478 en 15.3.3) — actualizado a 15.5.19
