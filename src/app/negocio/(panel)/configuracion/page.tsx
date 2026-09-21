"use client";

import { useEffect, useState, type FormEvent } from "react";
import { businessesApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import {
  ErrorBanner,
  TextareaField,
  TextField,
} from "@/src/components/ui/field";

export default function BusinessConfigPage() {
  const { business, refresh } = useBusinessPanel();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusKm, setRadiusKm] = useState("");
  const [baseFee, setBaseFee] = useState("");
  const [feePerKm, setFeePerKm] = useState("");
  const [freeOver, setFreeOver] = useState("");

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!business) return;
    setName(business.name);
    setDescription(business.description ?? "");
    setAddress(business.address ?? "");
    setPhone(business.phone ?? "");
  }, [business]);

  const handleSaveInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSavingInfo(true);
    setError(null);
    setSuccess(null);
    try {
      await businessesApi.update(business.id, {
        name,
        description,
        address,
        phone,
      });
      setSuccess("Datos del negocio actualizados.");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSavingInfo(false);
    }
  };

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLatitude(String(pos.coords.latitude));
      setLongitude(String(pos.coords.longitude));
    });
  };

  const handleSaveDelivery = async (e: FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSavingDelivery(true);
    setError(null);
    setSuccess(null);
    try {
      await businessesApi.update(business.id, {
        latitude,
        longitude,
        delivery_radius_km: radiusKm ? Number(radiusKm) : undefined,
        delivery_base_fee: baseFee ? Number(baseFee) : undefined,
        delivery_fee_per_km: feePerKm ? Number(feePerKm) : undefined,
        free_delivery_over: freeOver ? Number(freeOver) : undefined,
      });
      setSuccess("Configuración de envío actualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSavingDelivery(false);
    }
  };

  if (!business) return <p className="text-neutral-500">Cargando...</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        )}
        {success && <p className="mt-4 text-sm text-emerald-700">{success}</p>}
      </div>

      <form
        onSubmit={handleSaveInfo}
        className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <h2 className="font-semibold text-neutral-900">Datos del negocio</h2>
        <TextField
          id="c_name"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextareaField
          id="c_description"
          label="Descripción"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          id="c_address"
          label="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextField
          id="c_phone"
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" loading={savingInfo} className="w-fit">
          Guardar datos
        </Button>
      </form>

      <form
        onSubmit={handleSaveDelivery}
        className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <h2 className="font-semibold text-neutral-900">
          Zona y costo de envío
        </h2>
        <p className="text-xs text-neutral-500">
          Tu API no devuelve estos valores al consultar el negocio, así que este
          formulario siempre arranca en blanco — no se borraron, simplemente no
          se pueden leer de vuelta con el endpoint actual.
        </p>
        <div className="flex gap-3">
          <TextField
            id="c_lat"
            label="Latitud"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <TextField
            id="c_lng"
            label="Longitud"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          className="w-fit text-left text-xs text-emerald-700 hover:underline"
        >
          Usar mi ubicación actual
        </button>
        <TextField
          id="c_radius"
          label="Radio de entrega (km)"
          type="number"
          value={radiusKm}
          onChange={(e) => setRadiusKm(e.target.value)}
        />
        <div className="flex gap-3">
          <TextField
            id="c_base_fee"
            label="Costo base"
            type="number"
            step="0.01"
            value={baseFee}
            onChange={(e) => setBaseFee(e.target.value)}
          />
          <TextField
            id="c_fee_km"
            label="Costo por km"
            type="number"
            step="0.01"
            value={feePerKm}
            onChange={(e) => setFeePerKm(e.target.value)}
          />
        </div>
        <TextField
          id="c_free_over"
          label="Envío gratis desde"
          type="number"
          step="0.01"
          value={freeOver}
          onChange={(e) => setFreeOver(e.target.value)}
        />
        <Button type="submit" loading={savingDelivery} className="w-fit">
          Guardar envío
        </Button>
      </form>
    </div>
  );
}
