import { supabase } from '@base/supabase'
import { useQuery } from '@tanstack/react-query'
import { Affiliate } from '../types'

type UseAffiliates = {
  affiliates?: Affiliate[]
  isLoading: boolean
  error: Error | null
}

const useAffiliates = (): UseAffiliates => {
  const fetchAffiliates = async (): Promise<Affiliate[]> => {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .order('name', { ascending: true })

    if (error !== null) {
      throw Error(error.message)
    }

    return data
  }

  const { data, isLoading, error } = useQuery(['affiliates'], fetchAffiliates, {
    retry: false
  })

  return {
    affiliates: data,
    isLoading,
    error: error as Error
  }
}

export default useAffiliates
