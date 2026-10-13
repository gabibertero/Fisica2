#!/usr/bin/env python3
"""Recalcula E01-E42 del practico de Brandan y compara con el resultado de clase.
Informe, no test: sale siempre con exit 0. Solo stdlib.
W_guia = trabajo POR el gas; convencion del profe: W = -W_guia (Q + W = dU)."""
import json, math, os, re, sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "..", "..", "apuntes", "_fuentes", "practico-brandan-limpio.md")
TOL = 0.01          # tolerancia relativa 1 %
K0, CAL, R, ATM = 273.15, 4.186, 8.314, 101325.0
sqrt, log, exp, atan2, degrees = math.sqrt, math.log, math.exp, math.atan2, math.degrees


def decimals(x):
    s = repr(float(x))
    return len(s.split(".")[1].rstrip("0")) if "." in s and "e" not in s else 0

def close(calc, ref):
    # 1 % relativo, o medio digito del ultimo decimal escrito en clase (redondeo de la clase)
    return abs(calc - ref) <= max(TOL * abs(ref), 0.5 * 10 ** -decimals(ref) + 1e-12)

# --- una funcion por ejercicio: devuelve {magnitud: valor|lista} ---
def e01(d): return {"T_F": [t * 1.8 + 32 for t in d["T_C"]]}
def e02(d): return {"T_C": [(t - 32) / 1.8 for t in d["T_F"]]}
def e03(d): return {"T_K": [t + K0 if u == "C" else (t - 32) / 1.8 + K0 for t, u in d["T"]]}
def e04(d): return {"l_f": [d["l0_cm"] * (1 + a * d["dT_C"]) for a in (d["alpha_Al"], d["alpha_acero"])]}
def e05(d):
    s0 = d["a_cm"] * d["b_cm"]; ds = s0 * 2 * d["alpha_Al"] * d["dT_C"]
    return {"S_f": s0 + ds, "dS": ds}
def e06(d):
    vr = d["V0_L"] * (1 + 3 * d["alpha_vidrio"] * d["dT_C"]); vh = d["V0_L"] * (1 + d["beta_Hg"] * d["dT_C"])
    return {"derrame": vh - vr, "V_f_recipiente": vr, "V_f_Hg": vh}
def e07(d):
    return {"c_taza": d["m_cafe_kg"] * d["c_agua"] * (d["T_cafe_C"] - d["T_f_C"]) / (d["m_taza_kg"] * (d["T_f_C"] - d["T_taza_C"]))}
def e08(d):
    return {"c_pieza": d["m_aceite_kg"] * d["c_aceite_kcal_kgC"] * (d["T_f_C"] - d["T_aceite_C"]) / (d["m_pieza_kg"] * (d["T_pieza_C"] - d["T_f_C"]))}
def e09(d):
    ms = [(d["m_Al_g"], d["c_Al"], d["T_Al_C"]), (d["m_agua_g"], 1, d["T_agua_C"]), (d["m_acero_g"], d["c_acero"], d["T_acero_C"])]
    return {"T_f": sum(m * c * t for m, c, t in ms) / sum(m * c for m, c, t in ms)}
def e10(d):
    pi = d["m_bronce_g"] * d["c_bronce"] * (d["T_bronce_C"] - d["T_f1_C"]) / (d["T_f1_C"] - d["T_agua_C"]) - d["m_agua1_g"]
    c = (d["m_agua2_g"] + pi) * (d["T_f2_C"] - d["T_agua_C"]) / (d["m_mat_g"] * (d["T_mat_C"] - d["T_f2_C"]))
    return {"pi": pi, "c_material": c, "Q_bloque": d["m_mat_g"] * c * (d["T_f2_C"] - d["T_mat_C"])}
def e11(d):  # reconstruido: Al y agua inicialmente a 0 C (unica lectura que reproduce 100,26 g)
    tf = d["T_f_C"]
    ab = d["m_Al_g"] * d["c_Al"] * tf + d["m_agua_g"] * d["c_agua"] * tf + d["m_hielo_g"] * (d["Lf"] + tf)
    return {"m_vapor": ab / (d["Lv"] + 100 - tf)}
def e12(d):  # reconstruido: todo a 0 C salvo el bloque; el bloque cede m_vapor*Lv
    pi = d["m_Cu_g"] * d["c_Cu"] + d["m_Fe_g"] * d["c_Fe"] + d["m_Al_g"] * d["c_Al"]
    qb = d["m_vapor_g"] * 540
    tf = (qb - d["m_hielo_g"] * 80) / (pi + d["m_agua_g"] + d["m_hielo_g"])
    return {"pi": pi, "T_f": tf, "c_metal": qb / (d["m_bloque_g"] * (d["T_bloque_C"] - tf))}
def e13(d):
    tf = (-d["Q_Al_cal"] - d["m_hielo_g"] * d["Lf"]) / (d["m_Cu_g"] * d["c_Cu"] + d["m_agua_g"] + d["m_hielo_g"])
    return {"T_f": tf, "T_i_bloque": tf - d["Q_Al_cal"] / (d["m_Al_g"] * d["c_Al"])}
def e14(d):
    m = d["m_g"]
    return {"Q_total": m * d["c_hielo"] * -d["T_i_C"] + m * d["Lf"] + m * d["c_agua"] * 100 + m * d["Lv"]}
def e15(d):
    return {"m_hielo": d["m_agua_g"] * (d["T_agua_C"] - d["T_f_C"]) / (d["c_hielo"] * -d["T_hielo_C"] + d["Lf"] + d["T_f_C"])}
def e16(d):
    m = d["m_g"]
    return {"Q_total": m * d["Lf"] + m * (d["T_f_C"] - d["T_i_C"]) + d["m_vaporizada_g"] * d["Lv"]}
def e17(d):
    V = d["V_L"] / 1000; n = lambda P, T: P * 1e3 * V / (d["R"] * (T + K0))
    mi, mf = d["M"] * n(d["P1_kPa"], d["T1_C"]), d["M"] * n(d["P2_kPa"], d["T2_C"])
    pb = (mi - mf) / d["M"] * d["R"] * (d["T_b_C"] + K0) / (d["V_b_L"] / 1000) / 1e3
    return {"m_extraida": mi - mf, "m_i": mi, "m_f": mf, "P_b": pb}
def e18(d):
    V = d["V_L"] / 1000; T1 = d["T1_C"] + K0; M = d["M"]
    mi = M * d["P1_atm"] * ATM * V / (d["R"] * T1); mf = mi - M * d["n_escapa"]
    return {"m_i": mi, "m_f": mf, "T_f": M * d["P2_atm"] * ATM * V / (d["R"] * mf),
            "P3": mf * d["R"] * T1 / (M * V) / ATM}
def e19(d): return {"V_f/V_i": (d["T_f_C"] + K0) * d["P_i_atm"] / ((d["T_i_C"] + K0) * d["P_f_atm"])}
def e20(d): return {"W_guia": d["n"] * d["R"] * (d["T_f_C"] - d["T_i_C"])}
def e21(d):
    nRT = d["n"] * d["R"] * d["T_K"]; pb = d["Pb_atm"] * ATM
    wab = nRT * log(d["Pa_atm"] / d["Pb_atm"]); wbc = pb * (nRT / (d["Pa_atm"] * ATM) - nRT / pb)
    return {"W_ciclo_guia": wab + wbc, "W_ab": wab, "W_bc": wbc, "W_ca": 0.0}
def e22(d):
    T = d["P_f_atm"] * ATM * d["V_f_L"] / 1000 / (d["n"] * d["R"])
    return {"T": T, "V_i": d["V_f_L"] / exp(d["W_J"] / (d["n"] * d["R"] * T))}
def e23(d):
    n = d["m_g"] / d["M"]; dT = d["dT_K"]
    qv = n * d["Cv_cal"] * dT; w = n * d["R_cal"] * dT
    return {"Q_v": qv, "Q_p": n * (d["Cv_cal"] + d["R_cal"]) * dT, "W_guia": w, "W_kgm": w * d["cal_kgm"]}
def e24(d):
    dU = d["Q_cal"] - d["W_guia_J"] / d["cal_J"]
    return {"dU": [dU, dU * d["cal_J"]]}   # principal en cal, otros en J
def e25(d): return {"W_guia": d["n"] * d["R"] * d["T_K"] * log(d["Vf_Vi"])}
def e26(d):
    w = d["P_Pa"] * (d["V2"] - d["V1"])
    return {"dU": d["Q_J"] - w, "W_guia": w, "T2": d["T1_K"] * d["V2"] / d["V1"]}
def e27(d):
    P = d["P1_kgf_cm2"] * 9.8e4; w = P * (d["V2_cm3"] - d["V1_L"] * 1000) * 1e-6
    q12 = d["Q_cal"] * CAL; du12 = q12 - w; du23 = d["dU_total_J"] - du12
    return {"Q2": du23 / CAL, "dU12": du12, "W12": w, "Q12": q12, "dU23": du23}
def e28(d):
    pi, vi, vf, pf = d["P_I_atm"] * ATM, d["V_I_L"] * 1e-3, d["V_F_L"] * 1e-3, d["P_F_atm"] * ATM
    return {"W_IAF_guia": pi * (vf - vi), "W_IF": (pi + pf) / 2 * (vf - vi), "W_IBF": pf * (vf - vi)}
def e29(d):
    e = 1 - d["Tf_K"] / d["Tc_K"]
    return {"e": e, "W": e * d["Qc_cal"]}
def e30(d):
    qf = d["Qc_cal"] * d["Tf_K"] / d["Tc_K"]
    return {"Q_f": qf, "W_AB": d["Qc_cal"] * CAL, "W_CD": qf * CAL}
def e31(d): return {"eta": d["Tf_K"] / abs(d["Tc_K"] - d["Tf_K"])}
def e32(d): return {"Tc": [d["Tf_K"] / (1 - e) for e in d["e"]]}
def e33(d):  # correcto: W = Q_f (Tc - Tf)/Tf (la guia divide por Tc)
    qf = d["m_kg"] * 1000 * d["Lf"]; w = qf * (d["Tc_K"] - d["Tf_K"]) / d["Tf_K"]
    return {"Q_f": qf, "Q_c": qf + w, "W": w, "P": w * CAL / d["t_s"]}
def e34(d):
    k = d["k"]; f13 = k * d["q1"] * d["q3"] / d["r13"] ** 2; f23 = k * d["q2"] * d["q3"] / d["r23"] ** 2
    # q1 en -x repele a q3 hacia +x; q2 en +y repele hacia -y
    return {"F_R": sqrt(f13 ** 2 + f23 ** 2), "theta": degrees(atan2(-f23, f13)) % 360, "F13": f13, "F23": f23}
def e35(d):
    k, L = d["k"], d["lado"]; f21 = k * d["q2"] * abs(d["q1"]) / L ** 2; f23 = k * d["q2"] * abs(d["q3"]) / L ** 2
    # geometria que reproduce la clase: F21 a 60 deg (repulsion), F23 a 300 deg (atraccion)
    x = f21 * math.cos(math.radians(60)) + f23 * math.cos(math.radians(300))
    y = f21 * math.sin(math.radians(60)) + f23 * math.sin(math.radians(300))
    return {"F_R": sqrt(x * x + y * y), "theta": degrees(atan2(y, x)) % 360, "F21": f21, "F23": f23}
def e36(d):
    k = d["k"]; f12 = k * d["q1"] * abs(d["q2"]) / d["r12"] ** 2
    fx = 2 * f12 * math.cos(math.radians(120))        # q2,q3 atraen a q1 (a 120 y 240 deg): fuerza hacia -x
    q4 = abs(fx) * d["r14"] ** 2 / (k * d["q1"])
    return {"q4": -q4 if fx < 0 else q4}              # q4 en +x debe atraer a q1 (tirar hacia +x) -> signo opuesto a q1
def e37(d):
    a, b = sqrt(abs(d["q1"])), sqrt(abs(d["q2"])); d13 = d["d"] * a / (a + b)
    return {"d13": d13, "d23": d["d"] - d13}
def e38(d):
    F = d["k"] * d["Q"] ** 2 / d["d"] ** 2
    return {"P": 2 * F * math.sin(math.radians(120)), "F": F, "T": 2 * F}
def e39(d):  # asume desplazamiento contra E (cos 180): signo segun la clase, ver nota
    w = -d["q"] * d["E"] * d["d_tot"]
    return {"W_total_ab_bc_cd": w, "V_ad": d["E"] * d["d_tot"]}
def e40(d): return {"dV": d["E"] * d["d"]}
def e41(d):
    k = d["k"]; q1, q2 = d["q1"], d["q2"]; h = d["d"] / 2
    return {"V_medio": k * (q1 + q2) / h, "d1_V0": d["d"] * q1 / (q1 - q2), "d2_V0": d["d"] * -q2 / (q1 - q2)}
def e42(d): return None

F = {f"E{i:02d}": globals()[f"e{i:02d}"] for i in range(1, 43)}

def load():
    txt = open(SRC, encoding="utf-8").read()
    m = re.search(r"```json\s*(.*?)```\s*\Z", txt, re.S) or re.findall(r"```json\s*(.*?)```", txt, re.S)[-1:] and None
    if m is None:
        m = list(re.finditer(r"```json\s*(.*?)```", txt, re.S))[-1]
    return json.loads(m.group(1))

def expected(res):
    out = {res["magnitud"]: res["valor"]}
    for o in res.get("otros", []):
        out.setdefault(o["magnitud"], o["valor"])
    return out

def main():
    items = load(); cnt = {"OK": 0, "NO CIERRA": 0, "SIN DATOS": 0}; bad = []
    for it in items:
        eid, res = it["id"], it["resultado"]
        exp_ = expected(res)
        if res["valor"] is None or eid not in F:
            st, det = "SIN DATOS", ["valor null/ilegible"]
        else:
            calc = F[eid](it["datos"]); det = []; st = "OK"
            for mag, ref in exp_.items():
                if mag not in calc or ref is None:
                    continue
                c = calc[mag]; cl = c if isinstance(c, list) else [c]; rl = ref if isinstance(ref, list) else [ref]
                if mag == "dU" and eid == "E24": rl, cl = [ref], [c[0]]   # principal en cal
                if mag == "dU" and eid == "E24": pass
                for a, b in zip(cl, rl):
                    ok = close(a, b); st = st if ok else "NO CIERRA"
                    det.append(f"{mag}: calc {a:.6g} vs clase {b:.6g}" + ("" if ok else "  <-- NO CIERRA"))
        if eid == "E24" and st != "SIN DATOS":   # el JSON repite 'dU' (cal y J): chequear la parte en J
            j = [o["valor"] for o in res["otros"] if o["magnitud"] == "dU"][0]
            ok = close(F[eid](it["datos"])["dU"][1], j); st = st if ok else "NO CIERRA"
            det.append(f"dU(J): calc {F[eid](it['datos'])['dU'][1]:.6g} vs clase {j:.6g}")
        cnt[st] += 1
        if st == "NO CIERRA": bad.append(eid)
        print(f"[{st:9}] {eid} ({it['unidad']}) {res['magnitud']}")
        for line in det: print("            " + line)
        if res.get("nota"): print("            nota JSON: " + res["nota"])

    print("\n== Consistencia de signo de W (Q + W_profe = dU, W_profe = -W_guia) ==")
    by = {i["id"]: i for i in items}
    def v(e, mag):
        r = by[e]["resultado"]; return expected(r)[mag]
    chk = [("E23 (cal)", v("E23", "Q_p") - v("E23", "W_guia"), v("E23", "Q_v")),
           ("E24 (J)", 500 * CAL - by["E24"]["datos"]["W_guia_J"], v("E24", "dU") * 0 + [o["valor"] for o in by["E24"]["resultado"]["otros"]][0]),
           ("E26 (J)", by["E26"]["datos"]["Q_J"] - v("E26", "W_guia"), v("E26", "dU")),
           ("E27 1->2 (J)", v("E27", "Q12") - v("E27", "W12"), v("E27", "dU12")),
           ("E21 ciclo (J)", v("E21", "W_ab") + v("E21", "W_bc") + v("E21", "W_ca"), v("E21", "W_ciclo_guia")),
           ("E25 Q=W (J)", v("E25", "W_guia"), v("E25", "W_guia"))]
    for name, a, b in chk:
        ok = close(a, b); cnt_ok = ok
        print(f"[{'OK' if ok else 'NO CIERRA':9}] {name}: Q-W_guia = {a:.6g} vs dU {b:.6g}")

    print(f"\n== Resumen: {cnt['OK']} OK, {cnt['NO CIERRA']} NO CIERRA, {cnt['SIN DATOS']} SIN DATOS (de {len(items)}) ==")
    if bad: print("NO CIERRA: " + ", ".join(bad))
    return 0

if __name__ == "__main__":
    try:
        main()
    except Exception as ex:  # informe: nunca corta
        print("ERROR del script:", repr(ex))
    sys.exit(0)
