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

      console.log("Enviando payload:", payload);

      await businessesApi.update(business.id, payload);
      setSuccess("Configuración de envío y descuento actualizada.");
      refresh();
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

        <div className="border-t border-neutral-200 pt-4 mt-2">
          <h3 className="font-medium text-neutral-900 mb-3">
            Descuento general del negocio
          </h3>
          <p className="text-xs text-neutral-500 mb-3">
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
