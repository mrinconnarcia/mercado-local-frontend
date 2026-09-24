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
  const [discountPercentage, setDiscountPercentage] = useState("");

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

    setLatitude(business.latitude?.toString() ?? "");
    setLongitude(business.longitude?.toString() ?? "");
    setRadiusKm(business.delivery_radius_km?.toString() ?? "");
    setBaseFee(business.delivery_base_fee?.toString() ?? "");
    setFeePerKm(business.delivery_fee_per_km?.toString() ?? "");
    setFreeOver(business.free_delivery_over?.toString() ?? "");
    setDiscountPercentage(business.discount_percentage?.toString() ?? "0");
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
      const payload: any = {};

      if (latitude) payload.latitude = latitude;
      if (longitude) payload.longitude = longitude;
      if (radiusKm) payload.delivery_radius_km = Number(radiusKm);
      if (baseFee) payload.delivery_base_fee = Number(baseFee);
      if (feePerKm) payload.delivery_fee_per_km = Number(feePerKm);
      if (freeOver) payload.free_delivery_over = Number(freeOver);
      if (discountPercentage)
        payload.discount_percentage = Number(discountPercentage);

      await businessesApi.update(business.id, payload);
      setSuccess("Configuración de envío y descuento actualizada.");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSavingDelivery(false);
    }
  };

  if (!business) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-7 w-40 rounded bg-neutral-200" />
        <div className="h-64 rounded-xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl text-neutral-900">Configuración</h1>
        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckIcon />
            {success}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSaveInfo}
        className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-serif text-lg text-neutral-900">
          Datos del negocio
        </h2>
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
        className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-serif text-lg text-neutral-900">
          Zona y costo de envío
        </h2>
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
          className="flex w-fit items-center gap-1.5 text-left text-xs font-medium text-emerald-700 hover:underline"
        >
          <PinIcon />
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

        <div className="mt-2 border-t border-neutral-200 pt-4">
          <h3 className="mb-1.5 font-medium text-neutral-900">
            Descuento general del negocio
          </h3>
          <p className="mb-3 text-xs text-neutral-500">
            Aplica un descuento porcentual a todos los pedidos. Ej: 10 significa
            10% de descuento.
          </p>
          <TextField
            id="c_discount"
            label="Porcentaje de descuento (%)"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
          />
        </div>

        <Button type="submit" loading={savingDelivery} className="w-fit">
          Guardar envío y descuento
        </Button>
      </form>
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
