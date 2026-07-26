import { supabase } from "../../config/supabase";
import { AuthUser } from "../../types/auth";

type HodRow = {
  id: number;
  erpid: string;
  name: string;
  is_active: boolean;
  department_id: number | null;
  departments: { name: string; short_code: string | null } | { name: string; short_code: string | null }[] | null;
  password: string | null;
};

export const authenticateHod = async (
  erpId: string,
  password: string,
): Promise<AuthUser> => {

  const { data, error } = await supabase
    .from("hod")
    .select("id, erpid, name, is_active, department_id, departments ( name, short_code ), password")
    .ilike("erpid", erpId)
    .limit(1)
    .maybeSingle<HodRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("HOD account not found.");
  }

  if (password !== data.password){
    throw new Error("Invalid password.");
  }

  if (data.is_active === false) {
    throw new Error("This HOD account has been deactivated.");
  }

  if (!data.department_id) {
    throw new Error(
      "This HOD account has no department assigned yet. Please ask an admin to set a department for this account.",
    );
  }

  const departmentRelation = Array.isArray(data.departments)
    ? data.departments[0]
    : data.departments;

  return {
    id: String(data.id),
    erpId: data.erpid,
    name: data.name,
    role: "hod",
    departmentId: data.department_id,
    departmentName: departmentRelation?.name,
    departmentShortCode: departmentRelation?.short_code ?? undefined,
  };
};